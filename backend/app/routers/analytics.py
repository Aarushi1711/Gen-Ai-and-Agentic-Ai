import json
import re
from collections import Counter
from datetime import datetime

import requests
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


@router.get("/{project_id}")
def get_analytics(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    repo_row = db.query(Repo).filter(Repo.project_id == project_id).first()
    intel = json.loads(repo_row.full_analysis) if (repo_row and repo_row.full_analysis) else None

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
        # Accurate path: real byte-count percentages straight from GitHub.
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

            week_counts = Counter()
            for date_str in gh_data["recent_commits"]:
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                week_counts[dt.strftime("%b %d")] += 1
            commit_activity = [{"week": k, "commits": v} for k, v in week_counts.items()]

    elif intel:
        # ZIP uploads (or GitHub repos with no languages data): fall back to
        # what Repository Intelligence detected. We don't have byte counts
        # for a ZIP the way GitHub's API gives us for a repo, so this is an
        # equal-weighted approximation across detected languages — not as
        # precise as the GitHub path above, but real detected data instead
        # of an empty chart.
        languages = [t["name"] for t in intel.get("tech_stack", []) if t.get("category") == "language"]
        if not languages:
            # No language-category entries detected — fall back to every
            # detected technology so the chart isn't empty for a project
            # that's just, say, a pure-frontend repo with no backend language.
            languages = [t["name"] for t in intel.get("tech_stack", [])]
        if languages:
            share = round(100 / len(languages), 1)
            tech_stack_breakdown = [{"name": lang, "value": share} for lang in languages]
        # No GitHub API available for a ZIP upload, so commit history and
        # open issue counts genuinely don't exist here — left empty rather
        # than faked.

    # Code quality numbers straight from the AST analysis (works for both
    # GitHub and ZIP uploads now that Repository Intelligence runs on
    # ingestion). Replaces the old lines_of_code/files fields, which were
    # dead code — Repo.local_path was never a real column.
    code_quality = intel.get("code_quality") if intel else None

    return {
        "health_score_trend": health_score_trend,
        "category_scores": category_scores,
        "tech_stack_breakdown": tech_stack_breakdown,
        "commit_activity": commit_activity,
        "open_issues": open_issues,
        "has_github_data": bool(project.github_url),
        "python_files_analyzed": code_quality.get("python_files_analyzed") if code_quality else None,
        "total_functions": code_quality.get("total_functions") if code_quality else None,
        "total_classes": code_quality.get("total_classes") if code_quality else None,
        "avg_docstring_coverage_pct": code_quality.get("avg_docstring_coverage_pct") if code_quality else None,
    }
