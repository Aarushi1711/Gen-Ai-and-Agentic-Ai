"""
app/routers/repo_ingest.py

The real entry point behind your frontend's "GitHub Repo" and "ZIP
Upload" buttons on the Upload Project page. Owns getting a repo onto
disk (either way), handing it to Repository RAG for chat indexing,
running the Repository Intelligence analysis (tech stack, project
type, README score, code quality, AI summary) on the same local copy,
and recording both in the Repo table so downstream endpoints
(Architecture, Analytics, Dashboard) can find them.

NOTE: the Repository Intelligence module (repo_reader.py, detectors.py,
ast_analyzer.py, zip_handler.py, github_client.py, llm_summary.py)
lives at app/repo_intel/, a sibling of app/core/, app/models/,
app/routers/, and app/schemas/.
"""

import json
import os
import shutil
import tempfile

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.rag.github_fetch import download_github_repo, extract_uploaded_zip, cleanup_repo
from app.core.rag.repository_rag import ingest_repository
from app.repo_intel.repo_reader import analyze_local_path
from app.models.project import Project
from app.models.repo import Repo

router = APIRouter(prefix="/api/projects", tags=["repo-ingest"])


class GithubIngestRequest(BaseModel):
    repo_url: str
    project_id: str  # ties this repo to a specific project in your DB


def _run_repo_intel(local_path: str, source_type: str) -> dict:
    """
    Runs the Repository Intelligence pipeline against the already-downloaded
    /extracted local copy (no second network fetch needed — works
    identically for github and zip since both hand off a local folder).
    Never raises: intel analysis failing shouldn't block the upload from
    succeeding, since RAG ingestion (the part chat depends on) is separate
    and more important to not lose.
    """
    try:
        result = analyze_local_path(local_path, source_type=source_type, source_id=local_path)
    except Exception as e:
        return {"error": str(e)}
    return result


def _upsert_repo_row(db: Session, project_id: int, source_type: str, source_url: str | None, intel: dict) -> Repo:
    """
    Create (or refresh) the single Repo row for this project, so
    endpoints that query the Repo table (Architecture, Analytics,
    Dashboard) can find it once ingestion succeeds. One row per
    project — a re-upload updates the existing row in place rather
    than accumulating duplicates.
    """
    tech_stack = intel.get("tech_stack", []) if isinstance(intel, dict) else []
    languages = ", ".join(t["name"] for t in tech_stack if t.get("category") == "language")
    frameworks = ", ".join(t["name"] for t in tech_stack if t.get("category") != "language")

    # Store everything except the per-file AST breakdown (code_quality.files),
    # which can get large and isn't needed for dashboard-level display.
    trimmed = None
    if isinstance(intel, dict) and "error" not in intel:
        code_quality = dict(intel.get("code_quality", {}))
        code_quality.pop("files", None)
        trimmed = {
            "project_type": intel.get("project_type"),
            "platforms": intel.get("platforms"),
            "tech_stack": tech_stack,
            "code_quality": code_quality,
            "readme": intel.get("readme"),
            "project_summary": intel.get("project_summary"),
            "repository": intel.get("repository"),
        }

    repo_row = db.query(Repo).filter(Repo.project_id == project_id).first()
    if repo_row:
        repo_row.source_type = source_type
        repo_row.source_url = source_url
        repo_row.detected_languages = languages or repo_row.detected_languages
        repo_row.detected_frameworks = frameworks or repo_row.detected_frameworks
        repo_row.dependencies = json.dumps(tech_stack) if tech_stack else repo_row.dependencies
        repo_row.architecture_pattern = intel.get("project_type") if isinstance(intel, dict) else repo_row.architecture_pattern
        repo_row.full_analysis = json.dumps(trimmed) if trimmed else repo_row.full_analysis
    else:
        repo_row = Repo(
            project_id=project_id,
            source_type=source_type,
            source_url=source_url,
            detected_languages=languages or None,
            detected_frameworks=frameworks or None,
            dependencies=json.dumps(tech_stack) if tech_stack else None,
            architecture_pattern=intel.get("project_type") if isinstance(intel, dict) else None,
            full_analysis=json.dumps(trimmed) if trimmed else None,
        )
        db.add(repo_row)

    db.commit()
    db.refresh(repo_row)
    return repo_row


@router.post("/ingest-github")
def ingest_github(
    request: GithubIngestRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        project_id_int = int(request.project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="project_id must be numeric")

    project = db.query(Project).filter(Project.id == project_id_int).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        local_path = download_github_repo(request.repo_url)
        ingest_repository(local_path, request.project_id)
        intel = _run_repo_intel(local_path, source_type="github")
        cleanup_repo(local_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    _upsert_repo_row(db, project_id_int, source_type="github", source_url=request.repo_url, intel=intel)

    return {"status": "success", "project_id": request.project_id}


@router.post("/ingest-zip")
async def ingest_zip(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be a .zip")

    try:
        project_id_int = int(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="project_id must be numeric")

    project = db.query(Project).filter(Project.id == project_id_int).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    temp_dir = tempfile.mkdtemp(prefix="aaroh_upload_")
    zip_path = os.path.join(temp_dir, file.filename)
    intel = {}

    try:
        with open(zip_path, "wb") as f:
            content = await file.read()
            f.write(content)

        local_path = extract_uploaded_zip(zip_path)
        ingest_repository(local_path, project_id)
        intel = _run_repo_intel(local_path, source_type="zip")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

    _upsert_repo_row(db, project_id_int, source_type="zip", source_url=None, intel=intel)

    return {"status": "success", "project_id": project_id}
