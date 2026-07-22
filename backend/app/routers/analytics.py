import re
import requests
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.project import Project
from app.models.repo import Repo
from app.models.report import Report

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def parse_github_url(url: str):
    match = re.search(r"github\.com/([^/]+)/([^/]+?)(\.git)?/?$", url)
    if not match:
        return None, None
    return match.group(1), match.group(2)


def fetch_github_data(owner: str, repo: str):
    headers = {"Accept": "application/vnd.github+json"}
    base = f"https://api.github.com/repos/{owner}/{repo}"
    result = {"languages": {}, "open_issues": None, "recent_commits": []}
    try:
        lang_res = requests.get(f"{base}/languages", headers=headers, timeout=10)
        if lang_res.status_code == 200:
            result["languages"] = lang_res.json()
        repo_res = requests.get(base, headers=headers, timeout=10)
        if repo_res.status_code == 200:
            result["open_issues"] = repo_res.json().get("open_issues_count")
        commits_res = requests.get(f"{base}/commits", headers=headers, params={"per_page": 30}, timeout=10)
        if commits_res.status_code == 200:
            result["recent_commits"] = [
                c["commit"]["author"]["date"] for c in commits_res.json() if c.get("commit")
            ]
    except requests.RequestException:
        pass
    return result


def _count_repo_stats(repo_path: str) -> dict:
    """Counts lines of code and files in a locally cloned repo, if one exists.
    Safe no-op if the path doesn't exist or Repo has no local_path yet."""
    try:
        from app.core.rag.repository_rag import CODE_EXTENSIONS, EXCLUDED_DIRS
    except ImportError:
        return {"lines_of_code": 0, "files": 0}

    root = Path(repo_path)
    if not root.exists():
        return {"lines_of_code": 0, "files": 0}

    total_lines = 0
    total_files = 0
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

    # Local code stats — safe no-op until Repo.local_path exists / a clone has happened
    repo_row = db.query(Repo).filter(Repo.project_id == project_id).first()
    local_path = getattr(repo_row, "local_path", None) if repo_row else None
    code_stats = _count_repo_stats(local_path) if local_path else {"lines_of_code": 0, "files": 0}

    reports = (
        db.query(Report)
        .filter(Report.project_id == project_id)
        .order_by(Report.generated_at)
        .all()
    )

    health_score_trend = []
    category_scores = []

    for r in reports:
        scores = [
            r.architecture_score, r.scalability_score, r.documentation_score,
            r.deployment_readiness_score, r.code_quality_score,
            r.security_score, r.performance_score,
        ]
        valid_scores = [s for s in scores if s is not None]
        if valid_scores:
            avg = sum(valid_scores) / len(valid_scores)
            health_score_trend.append({
                "date": r.generated_at.isoformat(),
                "score": round(avg, 1),
            })

    if reports:
        latest = reports[-1]
        field_labels = [
            ("Architecture", latest.architecture_score),
            ("Scalability", latest.scalability_score),
            ("Documentation", latest.documentation_score),
            ("Deployment Readiness", latest.deployment_readiness_score),
            ("Code Quality", latest.code_quality_score),
            ("Security", latest.security_score),
            ("Performance", latest.performance_score),
        ]
        category_scores = [
            {"category": name, "score": score}
            for name, score in field_labels if score is not None
        ]

    tech_stack_breakdown = []
    commit_activity = []
    open_issues = None

    if project.github_url:
        owner, repo = parse_github_url(project.github_url)
        if owner and repo:
            gh_data = fetch_github_data(owner, repo)
            total_bytes = sum(gh_data["languages"].values())
            if total_bytes > 0:
                tech_stack_breakdown = [
                    {"name": lang, "value": round((bytes_ / total_bytes) * 100, 1)}
                    for lang, bytes_ in gh_data["languages"].items()
                ]
            open_issues = gh_data["open_issues"]

            from collections import Counter
            from datetime import datetime
            week_counts = Counter()
            for date_str in gh_data["recent_commits"]:
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                week_counts[dt.strftime("%b %d")] += 1
            commit_activity = [{"week": k, "commits": v} for k, v in week_counts.items()]

    return {
        "health_score_trend": health_score_trend,
        "category_scores": category_scores,
        "tech_stack_breakdown": tech_stack_breakdown,
        "commit_activity": commit_activity,
        "open_issues": open_issues,
        "has_github_data": bool(project.github_url),
        "lines_of_code": code_stats["lines_of_code"],
        "files": code_stats["files"],
    }