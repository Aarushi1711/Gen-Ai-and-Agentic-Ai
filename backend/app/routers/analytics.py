"""
app/routers/analytics.py

Structured project metrics — lines of code, file count, health score
trend over time. No LLM call here; this is a data-counting endpoint,
not retrieval or generation. Test coverage and open issues require
external tooling (pytest-cov, GitHub API) not yet wired up, so those
fields return null until that's added.
"""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.rag.repository_rag import CODE_EXTENSIONS, EXCLUDED_DIRS
from app.models.project import Project
from app.models.repo import Repo
from app.models.report import Report

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _count_repo_stats(repo_path: str) -> dict:
    total_lines = 0
    total_files = 0
    root = Path(repo_path)

    if not root.exists():
        return {"lines_of_code": 0, "files": 0}

    for file_path in root.rglob("*"):
        if not file_path.is_file() or file_path.suffix not in CODE_EXTENSIONS:
            continue
        if any(part in EXCLUDED_DIRS for part in file_path.parts):
            continue
        try:
            content = file_path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, PermissionError):
            continue
        total_lines += len(content.splitlines())
        total_files += 1

    return {"lines_of_code": total_lines, "files": total_files}


@router.get("/{project_id}")
def get_analytics(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    repo = db.query(Repo).filter(Repo.project_id == project_id).first()
    stats = (
        _count_repo_stats(repo.local_path)
        if repo and getattr(repo, "local_path", None)
        else {"lines_of_code": 0, "files": 0}
    )

    reports = (
        db.query(Report)
        .filter(Report.project_id == project_id)
        .order_by(Report.generated_at)
        .all()
    )

    health_score_trend = [
        {
            "date": r.generated_at.isoformat() if r.generated_at else None,
            "score": round(
                (
                    (r.architecture_score or 0)
                    + (r.scalability_score or 0)
                    + (r.documentation_score or 0)
                    + (r.deployment_readiness_score or 0)
                )
                / 4,
                1,
            ),
        }
        for r in reports
    ]

    return {
        "lines_of_code": stats["lines_of_code"],
        "files": stats["files"],
        "test_coverage": None,
        "open_issues": None,
        "health_score_trend": health_score_trend,
    }