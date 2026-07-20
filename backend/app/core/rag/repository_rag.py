"""
app/core/rag/repository_rag.py

Repository RAG: indexes a user's uploaded GitHub repo / ZIP so questions
like "explain this auth module" or "review my backend" can be answered
with real context from THEIR code.

Different from engineering_rag.py in one key way: it uses a Parent
Document Retriever. Code is split into small chunks for accurate
searching, but when a chunk matches, the retriever returns the FULL
FILE it came from (the "parent") — not just the fragment — because
reviewing code needs surrounding context, not an isolated snippet.

Each repo gets its own isolated index (separate ChromaDB collection +
separate parent-doc store), keyed by repo_id, so multiple projects
never mix results together.

Two entry points:
- ingest_repository(repo_path, repo_id)   -> run once per uploaded repo
- retrieve_repository_knowledge(query, repo_id, top_k) -> called by the
  router / Planner Agent to fetch relevant code + its file context
"""

import os
from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

# LangChain 1.x split some retrievers/storage into a separate
# "langchain-classic" package. Try the new location first, fall back
# to the old one, so this works regardless of which version you have.
try:
    from langchain_classic.retrievers import ParentDocumentRetriever
    from langchain_classic.storage import LocalFileStore
    from langchain_classic.storage._lc_store import create_kv_docstore
except ImportError:
    from langchain.retrievers import ParentDocumentRetriever
    from langchain.storage import LocalFileStore
    from langchain.storage._lc_store import create_kv_docstore

from app.core.rag.embeddings import get_embeddings

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_BASE_DIR = os.path.join(_THIS_DIR, "chroma_db", "repository")
DOCSTORE_BASE_DIR = os.path.join(_THIS_DIR, "parent_docs")

# File types worth indexing. Add more as needed.
CODE_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go", ".rb", ".php",
    ".c", ".cpp", ".h", ".cs", ".rs", ".md", ".json", ".yaml", ".yml",
}

# Never index these — they're huge, generated, or irrelevant noise.
EXCLUDED_DIRS = {
    "node_modules", ".git", "__pycache__", "venv", ".venv", "env",
    "dist", "build", ".next", "chroma_db", "parent_docs",
}

_retrievers: dict[str, ParentDocumentRetriever] = {}


def _load_repo_files(repo_path: str) -> list[Document]:
    """Walk repo_path and load every code file into a Document,
    skipping excluded folders and non-code files."""
    docs = []
    root = Path(repo_path)

    for file_path in root.rglob("*"):
        if not file_path.is_file():
            continue
        if file_path.suffix not in CODE_EXTENSIONS:
            continue
        if any(part in EXCLUDED_DIRS for part in file_path.parts):
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, PermissionError):
            continue

        if not content.strip():
            continue

        relative_path = str(file_path.relative_to(root))
        docs.append(Document(page_content=content, metadata={"source": relative_path}))

    return docs


def _build_retriever(repo_id: str) -> ParentDocumentRetriever:
    """Create (or reconnect to) the retriever for one specific repo."""
    vector_store = Chroma(
        collection_name=f"repo_{repo_id}",
        embedding_function=get_embeddings(),
        persist_directory=os.path.join(CHROMA_BASE_DIR, repo_id),
    )

    docstore_dir = os.path.join(DOCSTORE_BASE_DIR, repo_id)
    os.makedirs(docstore_dir, exist_ok=True)
    file_store = LocalFileStore(docstore_dir)
    doc_store = create_kv_docstore(file_store)

    # Small chunks for accurate matching. No parent_splitter is passed,
    # so the ORIGINAL whole-file documents become the "parents" that
    # get returned on a match.
    child_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)

    return ParentDocumentRetriever(
        vectorstore=vector_store,
        docstore=doc_store,
        child_splitter=child_splitter,
    )


def ingest_repository(repo_path: str, repo_id: str):
    """
    Index one repository. Run this once after a user uploads/connects
    a repo (repo_path = local folder the repo was extracted/cloned to,
    repo_id = a unique id for this project, e.g. your DB's project id).

    Safe to re-run — rebuilds that repo's index from scratch.
    """
    docs = _load_repo_files(repo_path)
    if not docs:
        print(f"No code files found in {repo_path}")
        return

    retriever = _build_retriever(repo_id)
    retriever.add_documents(docs)
    _retrievers[repo_id] = retriever

    print(f"Ingested {len(docs)} files for repo_id='{repo_id}'")


def retrieve_repository_knowledge(query: str, repo_id: str, top_k: int = 4) -> list[dict]:
    """
    THIS is the function the router (and eventually the Planner Agent)
    calls for repo-specific questions. Same shape philosophy as
    retrieve_engineering_knowledge() — but "content" here is a FULL
    FILE, not a small chunk, since that's what Parent Document
    Retriever returns.

    Returns a list of {"content": str, "source": str}.
    Empty list if nothing relevant found, or if this repo hasn't been
    ingested yet.
    """
    if repo_id not in _retrievers:
        _retrievers[repo_id] = _build_retriever(repo_id)

    retriever = _retrievers[repo_id]
    retriever.search_kwargs = {"k": top_k}

    docs = retriever.invoke(query)
    return [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
        }
        for doc in docs
    ]


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python -m app.core.rag.repository_rag <repo_path> <repo_id>")
        sys.exit(1)

    ingest_repository(sys.argv[1], sys.argv[2])