"""
test_repository_rag.py — put this in backend/ (same level as main.py)

Run with:  python -m test_repository_rag

This ingests a local code folder as a test "repository" and queries
it, so you can see Parent Document Retriever working end to end
without needing GitHub API / ZIP upload plumbing built yet.

By default it points at your own app/ folder as the "repo" to index —
change TEST_REPO_PATH to point at any other local project folder to
test with something bigger/different.
"""

import os

from app.core.rag.repository_rag import ingest_repository, retrieve_repository_knowledge

# Using your own backend/app folder as a stand-in "repository" to test with.
TEST_REPO_PATH = os.path.join(os.path.dirname(__file__), "app")
TEST_REPO_ID = "test-repo-1"

print(f"Ingesting {TEST_REPO_PATH} as repo_id='{TEST_REPO_ID}'...")
ingest_repository(TEST_REPO_PATH, TEST_REPO_ID)

queries = [
    "how does retrieval work in the engineering RAG",
    "how is the embedding model loaded",
    "what does the RAG API endpoint look like",
]

for q in queries:
    print(f"\nQuery: {q}")
    print("-" * 60)
    results = retrieve_repository_knowledge(q, TEST_REPO_ID, top_k=2)
    if not results:
        print("  No results found.")
    for r in results:
        print(f"  [{r['source']}]")
        print(f"  {r['content'][:250]}...\n")