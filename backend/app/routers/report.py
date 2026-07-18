from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.report import Report
from app.models.project import Project
from app.schemas.report import ReportCreate, ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/", response_model=ReportResponse)
def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == report.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_report = Report(**report.dict())
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/project/{project_id}", response_model=list[ReportResponse])
def get_reports_for_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Report).filter(Report.project_id == project_id).all()