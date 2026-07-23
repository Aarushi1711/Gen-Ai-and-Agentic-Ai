"""
app/routers/project_analysis.py

Exposes run_project_analysis() as the /api/projects/analyze endpoint
— what your frontend's "Analyze project" button on Upload Project hits.

Saves the generated milestones to Roadmap and a summary to Report,
so the Roadmap page and PDF Report actually have data after analysis
runs — not just this endpoint's JSON response.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.agents.graph import run_project_analysis
from app.models.project import Project
from app.models.report import Report
from app.models.roadmap import Roadmap

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

    # Save the roadmap milestones
    for m in result.get("milestones") or []:
        db.add(Roadmap(
            project_id=request.project_id,
            milestone_title=m["title"],
            milestone_description=m.get("description"),
            order_index=m["order"],
        ))

    # Save a report row with the AI's reasoning as commentary
    commentary = (
        f"Domain: {result.get('domain')} | Complexity: {result.get('complexity')}\n"
        f"Architecture: {result.get('architecture_pattern')} — {result.get('architecture_reasoning')}\n"
        f"Suggested features: {', '.join(result.get('suggested_features') or [])}"
    )
    db.add(Report(
        project_id=request.project_id,
        ai_commentary=commentary,
    ))

    db.commit()

    return result