from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.roadmap import Roadmap
from app.models.project import Project

from app.schemas.roadmap import (
    RoadmapCreate,
    RoadmapResponse,
)

router = APIRouter(
    prefix="/roadmaps",
    tags=["Roadmaps"],
)


@router.post("/", response_model=RoadmapResponse)
def create_milestone(
    roadmap: RoadmapCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    project = (
        db.query(Project)
        .filter(Project.id == roadmap.project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    milestone = Roadmap(**roadmap.dict())

    db.add(milestone)
    db.commit()
    db.refresh(milestone)

    return milestone


@router.get(
    "/project/{project_id}",
    response_model=list[RoadmapResponse],
)
def get_project_roadmap(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    milestones = (
        db.query(Roadmap)
        .filter(Roadmap.project_id == project_id)
        .order_by(Roadmap.order_index)
        .all()
    )

    return milestones