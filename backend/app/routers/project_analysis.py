"""
app/routers/project_analysis.py

Exposes run_project_analysis() as the /api/projects/analyze endpoint
— what your frontend's "Analyze project" button on Upload Project hits.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.agents.graph import run_project_analysis
from app.models.project import Project

router = APIRouter(prefix="/api/projects", tags=["project-analysis"])


class AnalyzeRequest(BaseModel):
    project_id: int
    title: str
    idea_description: str
    input_type: str = "idea"


@router.post("/analyze")
def analyze_project(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = run_project_analysis(
        project_id=request.project_id,
        title=request.title,
        idea_description=request.idea_description,
        input_type=request.input_type,
    )
    return result