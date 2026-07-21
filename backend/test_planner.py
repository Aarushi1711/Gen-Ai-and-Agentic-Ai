"""
test_planner.py — put this in backend/ (same level as main.py)

Run with:  python -m test_planner

Tests the full agentic loop: your question goes in, the Planner Agent
decides which RAG system to use, and you see which route it picked.
"""

from dotenv import load_dotenv
load_dotenv()

from backend.app.core.agents.planner import ask_planner

print("=" * 60)
print("Aaroh AI — Planner Agent")
print("=" * 60)

questions = [
    "what architecture should I use for a hackathon project",
    "how should I improve the UI of my login page",
]

for q in questions:
    print(f"\nQuestion: {q}")
    print("-" * 60)
    result = ask_planner(q)
    print(f"Route used: {result['route_used']}")
    print(f"Sources: {', '.join(result['sources']) if result['sources'] else 'none'}")
    print(f"\n{result['answer']}\n")

print("=" * 60)
print("Now try your own question (or 'quit' to stop):")
while True:
    q = input("\n> ").strip()
    if q.lower() in ("quit", "exit", "q"):
        break
    if not q:
        continue
    result = ask_planner(q)
    print(f"[Route: {result['route_used']}]")
    print(result["answer"])