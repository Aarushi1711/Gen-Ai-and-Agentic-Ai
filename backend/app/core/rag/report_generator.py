"""
app/core/rag/report_generator.py

Generates the actual content for the "Project Health Report" — the
piece that was missing. Report.py's router can already SAVE scores,
but nothing produced them. This does.

Uses Repository RAG to gather relevant code context, then asks Gemini
to return STRUCTURED scores (not prose) so they can go straight into
the Report table's numeric columns.
"""

import json
import re

from app.core.rag.generate import _get_model
from app.core.rag.repository_rag import retrieve_repository_knowledge

# Your frontend's
# Project Health page shows 6 categories (also code_quality, security,
# performance). Flag this mismatch to Aarushi — either add 2 columns,
# or trim the frontend to match. This generator produces all 6; drop
# the extra 2 when saving if the schema isn't updated yet.

CATEGORY_QUERIES = {
    "architecture": "overall code architecture and structure",
    "scalability": "scalability and ability to handle growth",
    "documentation": "code comments, docstrings, and README quality",
    "code_quality": "code cleanliness, naming, and best practices",
    "security": "security practices, credential handling, input validation",
    "performance": "performance, caching, and efficiency",
}


def generate_project_report(repo_id: str) -> dict:
    """
    Returns a dict matching (a superset of) the Report model's fields:
        {
            "architecture_score": float,
            "scalability_score": float,
            "documentation_score": float,
            "deployment_readiness_score": float,
            "code_quality_score": float,       # not yet in Report model
            "security_score": float,            # not yet in Report model
            "performance_score": float,         # not yet in Report model
            "ai_commentary": str,
        }
    Scores are 0-100. Call this, then save whichever fields your
    current Report schema supports.
    """
    context_sections = []
    for category, query in CATEGORY_QUERIES.items():
        chunks = retrieve_repository_knowledge(query, repo_id, top_k=3)
        if chunks:
            snippet = "\n".join(f"[{c['source']}]\n{c['content'][:500]}" for c in chunks)
            context_sections.append(f"## {category}\n{snippet}")

    context = "\n\n".join(context_sections) if context_sections else "No code found for this repo."

    prompt = f"""You are Aaroh AI, evaluating a student's codebase for a project health report.

Based on the code below, score each category from 0-100 and write a short
2-3 sentence overall commentary. Respond with ONLY valid JSON, no other text,
in exactly this shape:

{{
  "architecture_score": <number>,
  "scalability_score": <number>,
  "documentation_score": <number>,
  "deployment_readiness_score": <number>,
  "code_quality_score": <number>,
  "security_score": <number>,
  "performance_score": <number>,
  "ai_commentary": "<string>"
}}

Code to evaluate:
{context}
"""

    model = _get_model()
    response = model.generate_content(prompt)

    # Gemini sometimes wraps JSON in ```json fences despite instructions — strip them.
    text = response.text.strip()
    text = re.sub(r"^```json\s*|\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback so a bad parse doesn't crash the request — return
        # neutral scores and flag it in the commentary instead.
        return {
            "architecture_score": 50, "scalability_score": 50,
            "documentation_score": 50, "deployment_readiness_score": 50,
            "code_quality_score": 50, "security_score": 50, "performance_score": 50,
            "ai_commentary": "Could not generate a reliable report — try re-analyzing.",
        }