"""
app/schemas/mentor.py

Request/response shapes for the full ask-the-mentor endpoint
(retrieval + Gemini generation combined).
"""

from pydantic import BaseModel


class MentorAskRequest(BaseModel):
    question: str
    project_id: int
    top_k: int = 4


class MentorAskResponse(BaseModel):
    answer: str
    sources: list[str]