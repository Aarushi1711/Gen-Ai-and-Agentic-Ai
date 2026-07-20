"""
test_real_github_repo.py — put this in backend/ (same level as main.py)

Run with:  python -m test_real_github_repo

This is the FULL flow test: real GitHub URL -> download -> extract ->
ingest into Repository RAG -> query it. Uses a small public repo by
default so the download is fast.
"""

from app.core.rag.github_fetch import download_github_repo, cleanup_repo
from app.core.rag.repository_rag import ingest_repository, retrieve_repository_knowledge

# A small, real public repo to test against. Swap this for any repo URL.
REPO_URL = "https://github.com/pallets/flask"
REPO_ID = "test-flask-repo"

print(f"Downloading {REPO_URL}...")
local_path = download_github_repo(REPO_URL)
print(f"Extracted to: {local_path}")

print("\nIngesting into Repository RAG (this may take a minute for a real repo)...")
ingest_repository(local_path, REPO_ID)

queries = [
    "how does routing work",
    "how are configuration settings loaded",
]

for q in queries:
    print(f"\nQuery: {q}")
    print("-" * 60)
    results = retrieve_repository_knowledge(q, REPO_ID, top_k=2)
    for r in results:
        print(f"  [{r['source']}]")
        print(f"  {r['content'][:250]}...\n")

cleanup_repo(local_path)
print("\nCleaned up temp files.")