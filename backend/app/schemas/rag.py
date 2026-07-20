"""
app/schemas/rag.py

Request/response shapes for the RAG endpoint. This is the actual
contract your teammate (or the frontend) codes against.
"""

from pydantic import BaseModel


class RagQueryRequest(BaseModel):
    query: str
    top_k: int = 4


class RagChunk(BaseModel):
    content: str
    source: str
    score: float


class RagQueryResponse(BaseModel):
    results: list[RagChunk]