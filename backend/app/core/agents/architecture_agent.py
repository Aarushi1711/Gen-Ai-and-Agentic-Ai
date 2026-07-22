"""
app/core/agents/architecture_agent.py

Generates an architecture graph (nodes + edges) for a given repository
by asking the LLM to bucket files into architectural layers and infer
the connections between them, using context pulled from Repository RAG.

No new vector store, no GraphRAG — one structured-JSON LLM call over
context we already retrieve, same pattern as report_generator.py.
"""

import json
import re

from app.core.rag.generate import _get_model
from app.core.rag.repository_rag import retrieve_repository_knowledge

CATEGORIES = [
    "Frontend", "API Layer", "AI/ML", "Data Pipeline",
    "Auth", "Cache", "Database", "External",
]


def generate_architecture_graph(repo_id: str) -> dict:
    """
    Returns:
        {
            "nodes": [
                {"id": str, "label": str, "category": str, "detail": str}
            ],
            "edges": [
                {"source": str, "target": str, "label": str}
            ]
        }
    Returns empty nodes/edges if the repo hasn't been ingested or no
    relevant context is found — caller should handle that gracefully.
    """
    chunks = retrieve_repository_knowledge(
        "main entry points, API routes, database models, authentication, external service calls, caching",
        repo_id,
        top_k=8,
    )

    if not chunks:
        return {"nodes": [], "edges": []}

    context = "\n\n".join(
        f"[File: {c['source']}]\n{c['content'][:800]}" for c in chunks
    )

    prompt = f"""You are Aaroh AI, analyzing a codebase to produce an
architecture diagram.

Code from the repository:
{context}

Based on the files above, identify the distinct architectural components
(e.g. frontend app, API layer, auth service, database, cache, external
API integrations) and how data flows between them.

Respond with ONLY valid JSON, no other text, in exactly this shape:

{{
  "nodes": [
    {{"id": "<short_snake_case_id>", "label": "<Display Name>", "category": "<one of: {', '.join(CATEGORIES)}>", "detail": "<short phrase, e.g. 'FastAPI'>"}}
  ],
  "edges": [
    {{"source": "<node_id>", "target": "<node_id>", "label": "<e.g. 'REST/HTTPS', 'query', 'validates'>"}}
  ]
}}

Only include components you can actually infer from the code shown —
do not invent components that aren't evidenced by the files. Produce
between 4 and 10 nodes and their real connections. Keep labels short.
"""

    model = _get_model()
    response = model.generate_content(prompt)

    text = response.text.strip()
    text = re.sub(r"^```json\s*|\s*```$", "", text)

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        return {"nodes": [], "edges": []}

    if "nodes" not in result or "edges" not in result:
        return {"nodes": [], "edges": []}

    return result