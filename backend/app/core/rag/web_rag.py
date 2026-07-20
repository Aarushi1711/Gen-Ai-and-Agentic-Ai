"""
app/core/rag/web_rag.py

Web search fallback: when Engineering RAG doesn't have relevant local
knowledge for a question, this searches the web instead, so Gemini
still gets grounded context rather than answering from pure memory.

Uses Tavily (https://tavily.com) — built specifically for feeding LLMs,
returns clean content instead of raw HTML. Free tier: 1000 searches/month,
no credit card needed. Get a key at https://app.tavily.com

NOT used for Repository RAG questions — searching the web can't help
answer questions about someone's own uploaded code.
"""

import os
import requests

TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY")
TAVILY_URL = "https://api.tavily.com/search"


def search_web(query: str, max_results: int = 4) -> list[dict]:
    """
    Returns a list of {"content": str, "source": str (url), "title": str}.
    Returns an empty list (never raises) if the API key is missing or
    the request fails — caller should treat that the same as "no results".
    """
    if not TAVILY_API_KEY:
        print("TAVILY_API_KEY not set — skipping web fallback.")
        return []

    try:
        response = requests.post(
            TAVILY_URL,
            json={
                "api_key": TAVILY_API_KEY,
                "query": query,
                "max_results": max_results,
                "search_depth": "basic",
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        print(f"Web search failed: {e}")
        return []

    return [
        {
            "content": r.get("content", ""),
            "source": r.get("url", ""),
            "title": r.get("title", ""),
        }
        for r in data.get("results", [])
    ]