"""
test_rag.py — put this directly inside backend/ (same level as main.py)

Run with:  python -m test_rag
"""

from app.core.rag.engineering_rag import retrieve_engineering_knowledge

queries = [
    "what architecture should I use for a hackathon project",
    "how should I deploy a placement-focused project",
    "what tech stack is good for a beginner",
]

for q in queries:
    print(f"\nQuery: {q}")
    print("-" * 60)
    results = retrieve_engineering_knowledge(q, top_k=2)
    if not results:
        print("  No results found.")
    for r in results:
        print(f"  [{r['source']} | score={r['score']}]")
        print(f"  {r['content'][:200]}...\n")