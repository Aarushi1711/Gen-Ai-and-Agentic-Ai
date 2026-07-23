import os
import shutil
import tempfile

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.repo_intel.repo_reader import read_from_github, read_from_zip

router = APIRouter(prefix="/repo-intel", tags=["repo-intel"])


class RepoRequest(BaseModel):
    owner: str
    repo: str


@router.post("/analyze")
def analyze_repo(payload: RepoRequest):
    try:
        result = read_from_github(payload.owner, payload.repo)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-zip")
async def analyze_zip(file: UploadFile = File(...)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are supported")

    tmp_dir = tempfile.mkdtemp()
    tmp_path = os.path.join(tmp_dir, file.filename)

    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        result = read_from_zip(tmp_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)