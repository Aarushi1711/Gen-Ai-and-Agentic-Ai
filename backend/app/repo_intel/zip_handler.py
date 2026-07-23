"""
zip_handler.py
--------------
Handles uploaded ZIP projects: safe extraction + file tree walking.
Mirrors the shape of GitHubClient.get_file_tree() so the rest of the
pipeline (framework detection, README analysis, AST parsing) can treat
"GitHub repo" and "uploaded ZIP" identically after this step.
"""

import os
import zipfile
import tempfile
from pathlib import Path

# Directories we never want to walk into (noise, not signal)
IGNORE_DIRS = {
    ".git", "__pycache__", "node_modules", ".venv", "venv",
    "dist", "build", ".next", ".idea", ".vscode", "coverage",
}


def safe_extract(zip_path: str, extract_to: str | None = None) -> str:
    """
    Extracts a ZIP safely (guards against path traversal / zip-slip attacks,
    which is a real risk when accepting arbitrary user uploads).
    Returns the directory the project was extracted into.
    """
    extract_to = extract_to or tempfile.mkdtemp(prefix="aaroh_upload_")

    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.namelist():
            member_path = os.path.normpath(os.path.join(extract_to, member))
            if not member_path.startswith(os.path.abspath(extract_to)):
                raise ValueError(f"Blocked unsafe path in zip: {member}")
        zf.extractall(extract_to)

    # If the zip contains a single top-level folder (common GitHub "Download ZIP"
    # pattern: reponame-main/...), descend into it so paths look clean.
    entries = [e for e in os.listdir(extract_to) if not e.startswith("__MACOSX")]
    if len(entries) == 1 and os.path.isdir(os.path.join(extract_to, entries[0])):
        return os.path.join(extract_to, entries[0])
    return extract_to


def get_file_tree(root_dir: str) -> list[dict]:
    """
    Walks the extracted project and returns the same shape as
    GitHubClient.get_file_tree(): [{"path", "type", "size"}, ...]
    Paths are relative to root_dir, using forward slashes for consistency.
    """
    tree = []
    root = Path(root_dir)

    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS and not d.startswith(".")]

        for d in dirnames:
            rel = Path(dirpath, d).relative_to(root).as_posix()
            tree.append({"path": rel, "type": "tree", "size": 0})

        for f in filenames:
            full = Path(dirpath, f)
            rel = full.relative_to(root).as_posix()
            try:
                size = full.stat().st_size
            except OSError:
                size = 0
            tree.append({"path": rel, "type": "blob", "size": size})

    return tree


def read_file(root_dir: str, rel_path: str) -> str | None:
    """Read a text file's content by its relative path within the project."""
    full = Path(root_dir) / rel_path
    try:
        return full.read_text(encoding="utf-8", errors="replace")
    except (OSError, IsADirectoryError):
        return None


if __name__ == "__main__":
    # Build a tiny fake project zip to prove extraction + walking works,
    # without depending on any external download.
    import shutil

    demo_src = tempfile.mkdtemp(prefix="demo_src_")
    os.makedirs(os.path.join(demo_src, "myproject", "src"), exist_ok=True)
    os.makedirs(os.path.join(demo_src, "myproject", "node_modules", "junk"), exist_ok=True)

    with open(os.path.join(demo_src, "myproject", "README.md"), "w") as f:
        f.write("# My Project\n\nA demo Flask app.\n")
    with open(os.path.join(demo_src, "myproject", "requirements.txt"), "w") as f:
        f.write("flask\n")
    with open(os.path.join(demo_src, "myproject", "src", "app.py"), "w") as f:
        f.write("from flask import Flask\napp = Flask(__name__)\n")
    with open(os.path.join(demo_src, "myproject", "node_modules", "junk", "ignoreme.js"), "w") as f:
        f.write("// should be ignored")

    zip_path = shutil.make_archive("/tmp/demo_project", "zip", demo_src)
    print(f"Built test zip: {zip_path}")

    extracted = safe_extract(zip_path)
    print(f"Extracted to: {extracted}")

    tree = get_file_tree(extracted)
    print("File tree:")
    for item in tree:
        print(" ", item)

    print("\nREADME content:")
    print(read_file(extracted, "README.md"))
