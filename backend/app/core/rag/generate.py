"""
app/core/rag/generate.py

This is the piece that turns retrieved chunks into an actual AI-written
answer. It's the missing link between "raw paragraphs from ChromaDB"
and "Aaroh AI Mentor gives you a real response".

Flow: question -> retrieve_engineering_knowledge() -> this file builds
a prompt with those chunks -> Gemini generates the final answer.
"""

import os
import google.generativeai as genai

from app.core.rag.engineering_rag import retrieve_engineering_knowledge
from app.core.rag.repository_rag import retrieve_repository_knowledge
from app.core.rag.web_rag import search_web

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.5-flash"

_model = None


def _get_model():
    global _model
    if _model is None:
        if not GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Add it to your backend/.env file:\n"
                "GEMINI_API_KEY=your_key_here\n"
                "Get a free key at https://aistudio.google.com/apikey"
            )
        genai.configure(api_key=GEMINI_API_KEY)
        _model = genai.GenerativeModel(MODEL_NAME)
    return _model


def _build_prompt(question: str, chunks: list[dict]) -> str:
    if not chunks:
        context = "No specific engineering knowledge was found for this question."
    else:
        context = "\n\n".join(
            f"[Source: {c['source']}]\n{c['content']}" for c in chunks
        )

    return f"""You are Aaroh AI, a personalized AI project mentor for students and developers.

Answer the user's question using ONLY the retrieved engineering knowledge below.
If the retrieved knowledge doesn't cover the question, say so honestly instead
of making something up. Keep the tone encouraging and practical, like a
mentor talking to a student, not a textbook.

Retrieved knowledge:
{context}

User question: {question}

Your answer:"""


def ask_mentor(question: str, top_k: int = 4) -> dict:
    """
    THIS is the full RAG loop in one function: retrieve -> prompt -> generate.

    Returns:
        {
            "answer": "...",              # Gemini's generated response
            "sources": ["file1.md", ...], # which docs it drew from
            "chunks_used": [...]          # the raw chunks, for debugging/transparency
        }
    """
    chunks = retrieve_engineering_knowledge(question, top_k=top_k)
    prompt = _build_prompt(question, chunks)

    model = _get_model()
    response = model.generate_content(prompt)

    return {
        "answer": response.text,
        "sources": list({c["source"] for c in chunks}),
        "chunks_used": chunks,
    }


def ask_about_repo(question: str, repo_id: str, top_k: int = 4) -> dict:
    """
    Same idea as ask_mentor(), but for questions about a user's
    uploaded code instead of general engineering knowledge.
    e.g. "explain this auth module", "review my backend"
    """
    chunks = retrieve_repository_knowledge(question, repo_id, top_k=top_k)

    if not chunks:
        context = "No relevant code was found in this repository for this question."
    else:
        context = "\n\n".join(
            f"[File: {c['source']}]\n{c['content']}" for c in chunks
        )

    prompt = f"""You are Aaroh AI, reviewing a student's uploaded codebase.

Answer the user's question using ONLY the code below. Reference specific
files and functions by name where relevant. If something looks like a
bug or bad practice, mention it constructively, like a mentor would.

Code from their repository:
{context}

User question: {question}

Your answer:"""

    model = _get_model()
    response = model.generate_content(prompt)

    return {
        "answer": response.text,
        "sources": list({c["source"] for c in chunks}),
        "chunks_used": chunks,
    }


def ask_hybrid(question: str, repo_id: str | None = None, top_k: int = 3) -> dict:
    """
    THE full hybrid version matching the architecture diagram: pulls
    from BOTH Engineering RAG (general best practices) and Repository
    RAG (their actual code, if repo_id is given), merges both sets of
    context, and asks Gemini to answer using whichever is relevant.

    This is the simplest possible stand-in for what the Planner Agent
    will eventually do with smarter query reformulation — here it just
    sends the same question to both retrievers directly.
    """
    engineering_chunks = retrieve_engineering_knowledge(question, top_k=top_k)
    repo_chunks = retrieve_repository_knowledge(question, repo_id, top_k=top_k) if repo_id else []

    context_parts = []
    if engineering_chunks:
        context_parts.append("General engineering knowledge:\n" + "\n\n".join(
            f"[Source: {c['source']}]\n{c['content']}" for c in engineering_chunks
        ))
    if repo_chunks:
        context_parts.append("Code from their repository:\n" + "\n\n".join(
            f"[File: {c['source']}]\n{c['content']}" for c in repo_chunks
        ))

    context = "\n\n---\n\n".join(context_parts) if context_parts else "No relevant knowledge found."

    prompt = f"""You are Aaroh AI, a personalized AI project mentor.

Answer using ONLY the retrieved knowledge below — it may include general
engineering best practices, the user's own code, or both. Be specific
about which one you're drawing from when it matters.

Retrieved knowledge:
{context}

User question: {question}

Your answer:"""

    model = _get_model()
    response = model.generate_content(prompt)

    return {
        "answer": response.text,
        "engineering_sources": list({c["source"] for c in engineering_chunks}),
        "repo_sources": list({c["source"] for c in repo_chunks}),
    }


# Below this local knowledge quality, fall back to web search instead
# of trusting a weak/irrelevant local match. Tune this after watching
# real scores — 0.35 is a reasonable starting point, not a proven number.
WEB_FALLBACK_SCORE_THRESHOLD = 0.35


def ask_mentor_smart(question: str, top_k: int = 4) -> dict:
    """
    Same as ask_mentor(), but falls back to a live web search when local
    Engineering RAG doesn't have good coverage for the question — instead
    of either failing or letting Gemini guess from its own training data.

    This is a SEPARATE function from ask_mentor() on purpose — it doesn't
    replace it. Your teammate's Planner Agent can call whichever one fits
    a given situation; nothing about ask_mentor()'s existing contract changes.

    Returns the same shape as ask_mentor(), plus "used_web": bool so the
    frontend can show something like "answered using web search" for
    transparency.
    """
    chunks = retrieve_engineering_knowledge(question, top_k=top_k)

    best_score = max((c["score"] for c in chunks), default=0)
    used_web = False

    if best_score < WEB_FALLBACK_SCORE_THRESHOLD:
        web_results = search_web(question, max_results=4)
        if web_results:
            used_web = True
            context = "\n\n".join(
                f"[Source: {r['title']} — {r['source']}]\n{r['content']}" for r in web_results
            )
            sources = [r["source"] for r in web_results]
        else:
            # Web search also came up empty (or no API key) — fall back
            # to whatever weak local chunks exist rather than nothing.
            context = "\n\n".join(
                f"[Source: {c['source']}]\n{c['content']}" for c in chunks
            ) or "No relevant knowledge found locally or on the web."
            sources = [c["source"] for c in chunks]
    else:
        context = "\n\n".join(
            f"[Source: {c['source']}]\n{c['content']}" for c in chunks
        )
        sources = [c["source"] for c in chunks]

    prompt = f"""You are Aaroh AI, a personalized AI project mentor.

Answer the user's question using ONLY the retrieved knowledge below.
{"This knowledge came from a live web search, not your curated knowledge base — mention that naturally if relevant." if used_web else ""}
If the answer isn't covered, say so honestly.

Retrieved knowledge:
{context}

User question: {question}

Your answer:"""

    model = _get_model()
    response = model.generate_content(prompt)

    return {
        "answer": response.text,
        "sources": list(set(sources)),
        "used_web": used_web,
    }