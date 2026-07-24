"""
app/core/rag/engineering_rag.py

Engineering RAG: static knowledge base of software engineering best
practices (architecture patterns, tech stacks, deployment, etc).

Now backed by an in-memory TF-IDF vector store instead of ChromaDB +
sentence-transformers (see vector_store.py for why) -- no neural
embedding model to load, no database process, nothing that needs
hundreds of MB of RAM. Rebuilds automatically, in memory, the first
time it's queried after a process start.

Two entry points:
- ingest_knowledge_base()          -> optional manual (re)build
- retrieve_engineering_knowledge() -> called by the router (and eventually the
                                       Planner Agent) to fetch relevant chunks
"""

import os
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.rag.vector_store import TfidfVectorStore

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
KNOWLEDGE_BASE_DIR = os.path.join(_THIS_DIR, "knowledge_base")

_vector_store: TfidfVectorStore | None = None


def _build_vector_store() -> TfidfVectorStore:
    """Loads every .md file in knowledge_base/, chunks it, and indexes
    it into a fresh in-memory TF-IDF store. Runs once per process, lazily."""
    loader = DirectoryLoader(
        KNOWLEDGE_BASE_DIR,
        glob="**/*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    docs = loader.load()
    store = TfidfVectorStore()

    if not docs:
        print(f"No .md files found in {KNOWLEDGE_BASE_DIR}")
        return store

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    chunks = splitter.split_documents(docs)

    store.add_texts(
        texts=[c.page_content for c in chunks],
        metadatas=[c.metadata for c in chunks],
    )
    print(f"Loaded {len(docs)} docs / {len(chunks)} chunks into memory")
    return store


def ingest_knowledge_base():
    """Forces an immediate (re)build of the in-memory store instead of
    waiting for the first query. Useful for a manual CLI run:
        python -m app.core.rag.engineering_rag
    Not required on every startup -- retrieve_engineering_knowledge()
    builds it automatically on first use if this was never called.
    """
    global _vector_store
    _vector_store = _build_vector_store()


def _get_vector_store() -> TfidfVectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = _build_vector_store()
    return _vector_store


def retrieve_engineering_knowledge(query: str, top_k: int = 4) -> list[dict]:
    """
    THIS is the function the router (and eventually the Planner Agent /
    LangGraph tool) calls. Keep this signature stable once agreed with
    your teammate.

    Returns a list of {"content": str, "source": str, "score": float}.
    Empty list if nothing relevant found -- caller should handle that
    gracefully rather than erroring.
    """
    store = _get_vector_store()
    results = store.similarity_search_with_relevance_scores(query, k=top_k)
    return [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
            "score": round(score, 3),
        }
        for doc, score in results
    ]


if __name__ == "__main__":
    ingest_knowledge_base()