from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.repo import Repo
from app.models.project import Project
from app.schemas.repo import RepoCreate, RepoResponse

router = APIRouter(prefix="/repos", tags=["Repos"])

@router.post("/", response_model=RepoResponse)
def create_repo_analysis(
    repo: RepoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == repo.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_repo = Repo(**repo.dict())
    db.add(new_repo)
    db.commit()
    db.refresh(new_repo)
    return new_repo

@router.get("/project/{project_id}", response_model=list[RepoResponse])
def get_repos_for_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Repo).filter(Repo.project_id == project_id).all()