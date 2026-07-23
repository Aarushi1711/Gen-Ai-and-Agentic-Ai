"""
app/core/agents/graph.py

The missing function behind your /analyze endpoint. Takes a new
project's basic info (title, idea description, input type) and
produces a structured analysis: domain, complexity, recommended
architecture + stack, suggested features, and a milestone roadmap.

Single-shot generation using Engineering RAG for grounding — same
pattern as report_generator.py. Not a multi-step LangGraph flow;
planner.py (in this same folder) is a separate, simpler router for
chat questions.
"""

import json
import re

from app.core.rag.generate import _get_model
from app.core.rag.engineering_rag import retrieve_engineering_knowledge


def run_project_analysis(
    project_id: int,
    title: str,
    idea_description: str,
    input_type: str,
) -> dict:
    """
    Returns:
        {
            "domain": str,
            "complexity": str,
            "architecture_pattern": str,
            "architecture_reasoning": str,
            "recommended_stack": {
                "frontend": str, "backend": str,
                "database": str, "deployment": str,
            },
            "suggested_features": list[str],
            "milestones": [
                {"title": str, "description": str, "order": int}
            ],
            "project_id": int,
        }
    """
    context_chunks = retrieve_engineering_knowledge(
        f"architecture and tech stack recommendations for: {idea_description}",
        top_k=4,
    )
    context = "\n\n".join(
        f"[Source: {c['source']}]\n{c['content']}" for c in context_chunks
    ) or "No specific engineering guidance found — use general best practices."

    prompt = f"""You are Aaroh AI, analyzing a student's new project idea to
generate a starting plan.

Project title: {title}
Project description: {idea_description}
Input type: {input_type}

Relevant engineering guidance:
{context}

Respond with ONLY valid JSON, no other text, in exactly this shape:

{{
  "domain": "<e.g. 'Web App', 'Mobile App', 'AI/ML', 'Data Pipeline'>",
  "complexity": "<'Beginner' | 'Intermediate' | 'Advanced'>",
  "architecture_pattern": "<e.g. 'Monolithic', 'Microservices', 'Serverless'>",
  "architecture_reasoning": "<1-2 sentence explanation tied to the project>",
  "recommended_stack": {{
    "frontend": "<specific technology choice>",
    "backend": "<specific technology choice>",
    "database": "<specific technology choice>",
    "deployment": "<specific technology choice>"
  }},
  "suggested_features": ["<feature 1>", "<feature 2>", "<feature 3>"],
  "milestones": [
    {{"title": "<milestone name>", "description": "<1 sentence>", "order": 1}},
    {{"title": "<milestone name>", "description": "<1 sentence>", "order": 2}}
  ]
}}

Generate 3-5 suggested_features and 4-6 milestones, ordered from
setup to deployment.
"""

    model = _get_model()
    response = model.generate_content(prompt)

    text = response.text.strip()
    text = re.sub(r"^```json\s*|\s*```$", "", text)

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        result = {
            "domain": "General Software Project",
            "complexity": "Intermediate",
            "architecture_pattern": "Monolithic",
            "architecture_reasoning": "Default fallback — analysis generation failed to parse.",
            "recommended_stack": {
                "frontend": "React", "backend": "FastAPI",
                "database": "PostgreSQL", "deployment": "Render",
            },
            "suggested_features": [],
            "milestones": [
                {"title": "Project setup", "description": "Initialize repo and environment.", "order": 1},
                {"title": "Core feature build", "description": "Implement main functionality.", "order": 2},
                {"title": "Testing & polish", "description": "Fix bugs, improve UX.", "order": 3},
                {"title": "Deployment", "description": "Ship to a live environment.", "order": 4},
            ],
        }

    result["project_id"] = project_id
    return result