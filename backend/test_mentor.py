"""
test_mentor.py — put this in backend/ (same level as main.py and test_rag.py)

Run with:  python -m test_mentor

This is the full Gen-AI loop: your question -> retrieval -> Gemini ->
a real generated answer. No FastAPI server, no database needed.

Before running: add GEMINI_API_KEY to backend/.env
Get a free key at: https://aistudio.google.com/apikey
"""

from dotenv import load_dotenv
load_dotenv()

from app.core.rag.generate import ask_mentor

question = input("Ask Aaroh AI something (e.g. 'what architecture for a hackathon project'): ")

print("\nThinking...\n")
result = ask_mentor(question)

print("=" * 60)
print("ANSWER:")
print("=" * 60)
print(result["answer"])
print("\n" + "=" * 60)
print(f"Sources used: {', '.join(result['sources']) if result['sources'] else 'none'}")