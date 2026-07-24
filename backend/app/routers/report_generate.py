"""
app/routers/report_generate.py

The missing link: actually calls Report generation and saves it,
using Aarushi's existing Report model/table. This is what the
frontend's "Re-analyze" button on the Project Health page should hit.

Separate file from her app/routers/report.py (which only does plain
CRUD) so nothing of hers gets overwritten — just add this alongside it.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.rag.report_generator import generate_project_report
from app.models.project import Project
from app.models.report import Report

router = APIRouter(prefix="/api/reports", tags=["report-generation"])


@router.post("/generate")
def generate_report(
    project_id: int,
    repo_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = generate_project_report(repo_id)

    # Persist all generated report metrics in the Report table. Saving those; the other
    # 3 (code_quality, security, performance) are in `result` for the
    # frontend to use, but aren't persisted until the schema is extended.
    new_report = Report(
    project_id=project_id,
    architecture_score=result.get("architecture_score"),
    scalability_score=result.get("scalability_score"),
    documentation_score=result.get("documentation_score"),
    deployment_readiness_score=result.get("deployment_readiness_score"),
    code_quality_score=result.get("code_quality_score"),
    security_score=result.get("security_score"),
    performance_score=result.get("performance_score"),
    ai_commentary=result.get("ai_commentary"),
)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Return everything generated, including the 3 unsaved fields, so
    # the frontend can display all 6 categories even before the schema
    # catches up.
    return {
        "id": new_report.id,
        "project_id": project_id,
        **result,
        "generated_at": new_report.generated_at,
    }