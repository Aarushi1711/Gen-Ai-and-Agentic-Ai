"""
test_web_fallback.py — put this in backend/ (same level as main.py)

Run with:  python -m test_web_fallback

Requires TAVILY_API_KEY in your .env (get one free at app.tavily.com).

Tries a question your knowledge base SHOULD cover, then one it
definitely doesn't, so you can see the fallback trigger for yourself.
"""

from dotenv import load_dotenv
load_dotenv()

from app.core.rag.generate import ask_mentor_smart

questions = [
    "what architecture should I use for a hackathon project",   # in knowledge base
    "what's new in the latest version of React this year",       # definitely NOT in knowledge base
]

for q in questions:
    print(f"\nQuestion: {q}")
    print("-" * 60)
    result = ask_mentor_smart(q)
    print(f"Used web search: {result['used_web']}")
    print(f"Sources: {', '.join(result['sources'])}")
    print(f"\n{result['answer']}\n")