"""
app/schemas/mentor.py

Request/response shapes for the AI Mentor endpoint.
"""

from typing import Optional
from pydantic import BaseModel


class MentorAskRequest(BaseModel):
    question: str
    project_id: int

    # ===========================
    # NEW
    # Allows frontend to optionally pass repo_id.
    # If not passed, mentor.py will use project_id.
    # ===========================
    repo_id: Optional[str] = None

    top_k: int = 4


class MentorAskResponse(BaseModel):
    answer: str
    sources: list[str]

    # ===========================
    # NEW
    # Planner tells frontend which route answered.
    # Example:
    # general
    # repo
    # architecture
    # report
    # ui_ux
    # ===========================
    route_used: Optional[str] = None

    # ===========================
    # NEW
    # Used by Architecture Agent,
    # Report Generator,
    # Future UI Review etc.
    # ===========================
    data: Optional[dict] = None