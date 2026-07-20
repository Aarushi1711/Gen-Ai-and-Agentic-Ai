"""
app/routers/repo_ingest.py

The real entry point behind your frontend's "GitHub Repo" and "ZIP
Upload" buttons on the Upload Project page. Owns getting a repo onto
disk (either way) and handing it to Repository RAG for indexing.
"""

import os
import shutil
import tempfile

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from app.core.rag.github_fetch import download_github_repo, extract_uploaded_zip, cleanup_repo
from app.core.rag.repository_rag import ingest_repository

router = APIRouter(prefix="/api/projects", tags=["repo-ingest"])


class GithubIngestRequest(BaseModel):
    repo_url: str
    project_id: str  # ties this repo to a specific project in your DB


@router.post("/ingest-github")
def ingest_github(request: GithubIngestRequest):
    try:
        local_path = download_github_repo(request.repo_url)
        ingest_repository(local_path, request.project_id)
        cleanup_repo(local_path)
        return {"status": "success", "project_id": request.project_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ingest-zip")
async def ingest_zip(project_id: str = Form(...), file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be a .zip")

    temp_dir = tempfile.mkdtemp(prefix="aaroh_upload_")
    zip_path = os.path.join(temp_dir, file.filename)

    try:
        with open(zip_path, "wb") as f:
            content = await file.read()
            f.write(content)

        local_path = extract_uploaded_zip(zip_path)
        ingest_repository(local_path, project_id)
        return {"status": "success", "project_id": project_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)