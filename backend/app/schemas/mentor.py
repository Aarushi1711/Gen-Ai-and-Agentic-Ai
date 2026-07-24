"""
app/schemas/mentor.py

Request/response shapes for the full ask-the-mentor endpoint
(retrieval + Gemini generation combined).
"""
from typing import Optional, Any
from pydantic import BaseModel


class MentorAskRequest(BaseModel):
    question: str
    project_id: int
    repo_id: Optional[str] = None
    top_k: int = 4


class MentorAskResponse(BaseModel):
    answer: str
    sources: list[str]
    route_used: Optional[str] = None
    data: Optional[Any] = None