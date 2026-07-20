"""
app/routers/rag.py

Exposes retrieve_engineering_knowledge() as an HTTP endpoint so anything
(the Planner Agent's LangGraph tool, the frontend directly, a curl
command for testing) can call it without importing your Python code
directly. This is the "clean handoff" boundary with your teammate.
"""

from fastapi import APIRouter

from app.core.rag.engineering_rag import retrieve_engineering_knowledge
from app.schemas.rag import RagQueryRequest, RagQueryResponse

router = APIRouter(prefix="/api/rag", tags=["rag"])


@router.post("/query", response_model=RagQueryResponse)
def query_engineering_rag(request: RagQueryRequest):
    results = retrieve_engineering_knowledge(request.query, top_k=request.top_k)
    return RagQueryResponse(results=results)