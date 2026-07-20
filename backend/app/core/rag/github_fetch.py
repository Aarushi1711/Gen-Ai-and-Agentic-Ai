"""
app/core/rag/github_fetch.py

Minimal utility: takes a GitHub repo URL, downloads it as a ZIP, and
extracts it to a local temp folder. This is the SMALLEST possible
version of "Repository Intelligence" — just enough to hand a real
folder to ingest_repository() for testing.

This is NOT the full Repository Analysis Agent (folder structure
summaries, git status, AST parsing, framework detection, README
parsing) — that's a bigger, separate piece, and per your team's
proposal it's Member 3's scope, not RAG. This file only exists so
YOU can test Repository RAG against real external repos instead of
only your own code.
"""

import os
import shutil
import tempfile
import zipfile

import requests


def download_github_repo(repo_url: str, branch: str = None) -> str:
    """
    repo_url: e.g. "https://github.com/owner/repo"
    branch: e.g. "main" — if None, tries "main" then falls back to "master"

    Returns the local folder path where the repo was extracted.
    Caller is responsible for cleaning it up when done (see cleanup_repo below).
    """
    owner_repo = repo_url.rstrip("/").replace("https://github.com/", "")
    if "/" not in owner_repo:
        raise ValueError(f"Couldn't parse owner/repo from: {repo_url}")

    branches_to_try = [branch] if branch else ["main", "master"]

    for b in branches_to_try:
        zip_url = f"https://codeload.github.com/{owner_repo}/zip/refs/heads/{b}"
        response = requests.get(zip_url, timeout=30)
        if response.status_code == 200:
            break
    else:
        raise RuntimeError(
            f"Couldn't download {repo_url} — tried branches {branches_to_try}. "
            "Check the URL is correct and the repo is public."
        )

    temp_dir = tempfile.mkdtemp(prefix="aaroh_repo_")
    zip_path = os.path.join(temp_dir, "repo.zip")
    with open(zip_path, "wb") as f:
        f.write(response.content)

    with zipfile.ZipFile(zip_path, "r") as z:
        z.extractall(temp_dir)
    os.remove(zip_path)

    # GitHub zips extract into a single subfolder like "repo-main" — find it
    extracted = [d for d in os.listdir(temp_dir) if os.path.isdir(os.path.join(temp_dir, d))]
    if not extracted:
        raise RuntimeError("Extraction produced no folder — zip may be malformed.")

    return os.path.join(temp_dir, extracted[0])


def cleanup_repo(local_path: str):
    """Delete the temp folder once you're done ingesting it."""
    parent_temp_dir = os.path.dirname(local_path)
    if os.path.exists(parent_temp_dir):
        shutil.rmtree(parent_temp_dir, ignore_errors=True)


def extract_uploaded_zip(zip_file_path: str) -> str:
    """
    zip_file_path: path to a .zip file already saved on disk (e.g. from
    a FastAPI UploadFile that your router saved to a temp location).

    Returns the local folder path where it was extracted — same shape
    as download_github_repo(), so both feed ingest_repository() identically.
    """
    temp_dir = tempfile.mkdtemp(prefix="aaroh_zip_")

    with zipfile.ZipFile(zip_file_path, "r") as z:
        z.extractall(temp_dir)

    # If the zip contains one single top-level folder, use that as the
    # root (matches GitHub's zip export behavior). Otherwise use temp_dir
    # itself as the root.
    entries = [e for e in os.listdir(temp_dir) if not e.startswith("__MACOSX")]
    dirs_only = [e for e in entries if os.path.isdir(os.path.join(temp_dir, e))]

    if len(dirs_only) == 1 and len(entries) == 1:
        return os.path.join(temp_dir, dirs_only[0])
    return temp_dir