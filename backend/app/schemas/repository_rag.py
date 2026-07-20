"""
app/schemas/repository_rag.py

Request/response shapes for the repository RAG endpoint.
"""

from pydantic import BaseModel


class RepoQueryRequest(BaseModel):
    query: str
    repo_id: str
    top_k: int = 4


class RepoChunk(BaseModel):
    content: str
    source: str


class RepoQueryResponse(BaseModel):
    results: list[RepoChunk]