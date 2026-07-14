from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.roadmap import Roadmap
from app.models.project import Project
from app.schemas.roadmap import RoadmapCreate, RoadmapResponse

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])

@router.post("/", response_model=RoadmapResponse)
def create_milestone(
    roadmap: RoadmapCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == roadmap.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_milestone = Roadmap(**roadmap.dict())
    db.add(new_milestone)
    db.commit()
    db.refresh(new_milestone)
    return new_milestone

@router.get("/project/{project_id}", response_model=list[RoadmapResponse])
def get_roadmap_for_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return (
        db.query(Roadmap)
        .filter(Roadmap.project_id == project_id)
        .order_by(Roadmap.order_index)
        .all()
    )