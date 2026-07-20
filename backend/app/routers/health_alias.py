from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.report import Report
from app.schemas.report import ReportResponse

router = APIRouter(prefix="/health", tags=["Health (alias)"])


@router.get("/{project_id}", response_model=list[ReportResponse])
def get_health_report(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Report).filter(Report.project_id == project_id).all()


@router.get("/{project_id}/history", response_model=list[ReportResponse])
def get_health_history(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return (
        db.query(Report)
        .filter(Report.project_id == project_id)
        .order_by(Report.generated_at)
        .all()
    )