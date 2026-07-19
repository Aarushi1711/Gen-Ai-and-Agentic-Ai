from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.roadmap import Roadmap
from app.schemas.roadmap import RoadmapResponse

router = APIRouter(prefix="/roadmap", tags=["Roadmap (alias)"])


@router.get("/{project_id}", response_model=list[RoadmapResponse])
def get_roadmap(
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


@router.put("/{project_id}/milestones/{milestone_id}", response_model=RoadmapResponse)
def update_milestone(
    project_id: int,
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    milestone = (
        db.query(Roadmap)
        .filter(Roadmap.id == milestone_id, Roadmap.project_id == project_id)
        .first()
    )
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    return milestone