"""
app/core/rag/repository_rag.py

Repository RAG: indexes a user's uploaded GitHub repo / ZIP so questions
like "explain this auth module" or "review my backend" can be answered
with real context from THEIR code.

Same Parent Document Retriever IDEA as before (search small chunks for
accuracy, return the full file for context) — but implemented directly
instead of using LangChain's ParentDocumentRetriever class. That class
depends on langchain-classic's internal serialization, which kept
breaking across package version mismatches. This version stores parent
files as plain JSON on disk — no LangChain internals involved, so it
can't break the same way again.

Each repo gets its own isolated index (separate ChromaDB collection +
separate parent-doc JSON file), keyed by repo_id, so multiple projects
never mix results together.

Two entry points:
- ingest_repository(repo_path, repo_id)   -> run once per uploaded repo
- retrieve_repository_knowledge(query, repo_id, top_k) -> called by the
  router / Planner Agent to fetch relevant code + its file context
"""

import os
import json
import uuid
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

from app.core.rag.embeddings import get_embeddings

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_BASE_DIR = os.path.join(_THIS_DIR, "chroma_db", "repository")
PARENT_DOCS_DIR = os.path.join(_THIS_DIR, "parent_docs")

CODE_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go", ".rb", ".php",
    ".c", ".cpp", ".h", ".cs", ".rs", ".md", ".json", ".yaml", ".yml",
}

EXCLUDED_DIRS = {
    "node_modules", ".git", "__pycache__", "venv", ".venv", "env",
    "dist", "build", ".next", "chroma_db", "parent_docs",
}

# Filenames that commonly hold real secrets, even if their extension
# looks like harmless config. Checked against the filename only.
SENSITIVE_FILENAME_MARKERS = (
    ".env", "credential", "secret", "id_rsa", "id_ed25519", ".pem",
    ".pfx", ".key", "service-account", "serviceaccount", "firebase-adminsdk",
)


def _is_sensitive_file(filename: str) -> bool:
    lower = filename.lower()
    return any(marker in lower for marker in SENSITIVE_FILENAME_MARKERS)

_vector_stores: dict[str, Chroma] = {}


def _parent_docs_path(repo_id: str) -> str:
    os.makedirs(PARENT_DOCS_DIR, exist_ok=True)
    return os.path.join(PARENT_DOCS_DIR, f"{repo_id}.json")


def _load_parent_docs(repo_id: str) -> dict:
    path = _parent_docs_path(repo_id)
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_parent_docs(repo_id: str, parent_docs: dict):
    with open(_parent_docs_path(repo_id), "w", encoding="utf-8") as f:
        json.dump(parent_docs, f)


def _load_repo_files(repo_path: str) -> list[dict]:
    """Walk repo_path and load every code file as {"content": str, "source": str}."""
    files = []
    root = Path(repo_path)

    for file_path in root.rglob("*"):
        if not file_path.is_file():
            continue
        if file_path.suffix not in CODE_EXTENSIONS:
            continue
        if any(part in EXCLUDED_DIRS for part in file_path.parts):
            continue
        if _is_sensitive_file(file_path.name):
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, PermissionError):
            continue

        if not content.strip():
            continue

        relative_path = str(file_path.relative_to(root))
        files.append({"content": content, "source": relative_path})

    return files


def _get_vector_store(repo_id: str) -> Chroma:
    if repo_id not in _vector_stores:
        _vector_stores[repo_id] = Chroma(
            collection_name=f"repo_{repo_id}",
            embedding_function=get_embeddings(),
            persist_directory=os.path.join(CHROMA_BASE_DIR, repo_id),
        )
    return _vector_stores[repo_id]


def ingest_repository(repo_path: str, repo_id: str):
    """
    Index one repository. Run this once after a user uploads/connects
    a repo (repo_path = local folder the repo was extracted/cloned to,
    repo_id = a unique id for this project, e.g. your DB's project id).
    """
    files = _load_repo_files(repo_path)
    if not files:
        print(f"No code files found in {repo_path}")
        return

    child_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    vector_store = _get_vector_store(repo_id)
    parent_docs = _load_parent_docs(repo_id)

    texts, metadatas = [], []
    for file in files:
        parent_id = str(uuid.uuid4())
        parent_docs[parent_id] = {"content": file["content"], "source": file["source"]}

        chunks = child_splitter.split_text(file["content"])
        for chunk in chunks:
            texts.append(chunk)
            metadatas.append({"parent_id": parent_id, "source": file["source"]})

    vector_store.add_texts(texts=texts, metadatas=metadatas)
    _save_parent_docs(repo_id, parent_docs)

    print(f"Ingested {len(files)} files for repo_id='{repo_id}'")


def retrieve_repository_knowledge(query: str, repo_id: str, top_k: int = 4) -> list[dict]:
    """
    THIS is the function the router (and eventually the Planner Agent)
    calls for repo-specific questions. "content" here is a FULL FILE,
    not a small chunk — small chunks are only used internally for search
    accuracy, the full parent file is what gets returned.

    Returns a list of {"content": str, "source": str}.
    Empty list if nothing relevant found, or if this repo hasn't been
    ingested yet.
    """
    vector_store = _get_vector_store(repo_id)
    parent_docs = _load_parent_docs(repo_id)

    if not parent_docs:
        return []

    # Search more child chunks than top_k, since multiple chunks can
    # point to the same parent file — then dedupe down to top_k files.
    child_results = vector_store.similarity_search(query, k=top_k * 3)

    seen_parent_ids = []
    for doc in child_results:
        parent_id = doc.metadata.get("parent_id")
        if parent_id and parent_id not in seen_parent_ids:
            seen_parent_ids.append(parent_id)
        if len(seen_parent_ids) >= top_k:
            break

    return [
        {
            "content": parent_docs[pid]["content"],
            "source": parent_docs[pid]["source"],
        }
        for pid in seen_parent_ids
        if pid in parent_docs
    ]


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python -m app.core.rag.repository_rag <repo_path> <repo_id>")
        sys.exit(1)

    ingest_repository(sys.argv[1], sys.argv[2])