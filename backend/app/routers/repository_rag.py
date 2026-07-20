"""
app/routers/repository_rag.py

Exposes retrieve_repository_knowledge() over HTTP. Same integration
philosophy as app/routers/rag.py — your teammate's Planner Agent calls
this the same way, just with an extra repo_id to say which project.
"""

from fastapi import APIRouter

from app.core.rag.repository_rag import retrieve_repository_knowledge
from app.schemas.repository_rag import RepoQueryRequest, RepoQueryResponse

router = APIRouter(prefix="/api/rag", tags=["repository-rag"])


@router.post("/repo-query", response_model=RepoQueryResponse)
def query_repository_rag(request: RepoQueryRequest):
    results = retrieve_repository_knowledge(request.query, request.repo_id, top_k=request.top_k)
    return RepoQueryResponse(results=results)