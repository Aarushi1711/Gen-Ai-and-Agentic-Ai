from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.agents.graph import run_project_analysis
from app.models.project import Project
from app.models.report import Report
from app.models.roadmap import Roadmap

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.post("/analyze/{project_id}")
def analyze_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = run_project_analysis(
        project_id=project.id,
        title=project.title,
        idea_description=project.idea_description or "",
        input_type=project.input_type,
    )

    # Save the roadmap milestones
    for m in result.get("milestones") or []:
        db.add(Roadmap(
            project_id=project.id,
            milestone_title=m["title"],
            milestone_description=m.get("description"),
            order_index=m["order_index"],
        ))

    # Save a report row with the AI's reasoning as commentary
    commentary = (
        f"Domain: {result.get('domain')} | Complexity: {result.get('complexity')}\n"
        f"Architecture: {result.get('architecture_pattern')} — {result.get('architecture_reasoning')}\n"
        f"Suggested features: {', '.join(result.get('suggested_features') or [])}"
    )
    db.add(Report(
        project_id=project.id,
        ai_commentary=commentary,
    ))

    db.commit()

    return {
        "message": "Analysis complete",
        "domain": result.get("domain"),
        "recommended_stack": result.get("recommended_stack"),
        "architecture_pattern": result.get("architecture_pattern"),
        "suggested_features": result.get("suggested_features"),
        "milestones_created": len(result.get("milestones") or []),
    }