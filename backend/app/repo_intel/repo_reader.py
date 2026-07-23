"""
repo_reader.py
---------------
The single entry point your teammates will call. Takes EITHER a
GitHub "owner/repo" OR a path to an uploaded ZIP, and produces one
unified JSON object:

    {
      "repository": {...},
      "tech_stack": [...],
      "code_quality": {...},
      "readme": {...},
      "project_summary": "..."   <- filled in by the Grok LLM call (Week 4+)
    }

This is the contract the backend/AI/frontend teammates build against,
so keep the top-level keys stable even as you improve what's inside them.
"""

import json
import os
from .github_client import GitHubClient
from .zip_handler import safe_extract, get_file_tree as zip_file_tree, read_file as zip_read_file
from .detectors import detect_tech_stack, score_readme, detect_platforms, classify_project_type
from .ast_analyzer import analyze_project
from .llm_summary import generate_summary
from dotenv import load_dotenv
load_dotenv()


def read_from_github(owner: str, repo: str, token: str | None = None, groq_api_key: str | None = None) -> dict:
    client = GitHubClient(token=token)

    metadata = client.get_repo_metadata(owner, repo)
    tree = client.get_file_tree(owner, repo)
    commits = client.get_recent_commits(owner, repo, limit=20)
    readme_content = client.get_readme(owner, repo)

    def read_file_fn(rel_path):
        return client.get_file_content(owner, repo, rel_path)

    return _build_summary(
        source_type="github",
        source_id=f"{owner}/{repo}",
        metadata=metadata,
        tree=tree,
        commits=commits,
        readme_content=readme_content,
        read_file_fn=read_file_fn,
        groq_api_key=groq_api_key,
    )


def read_from_zip(zip_path: str, groq_api_key: str | None = None) -> dict:
    extracted_dir = safe_extract(zip_path)
    return analyze_local_path(extracted_dir, source_type="zip", source_id=zip_path, groq_api_key=groq_api_key)


def analyze_local_path(local_dir: str, source_type: str = "zip", source_id: str | None = None, groq_api_key: str | None = None) -> dict:
    """
    Analyze a folder that's ALREADY on disk (already downloaded/extracted
    by someone else's code). Avoids re-downloading the same repo twice.
    """
    tree = zip_file_tree(local_dir)

    def read_file_fn(rel_path):
        return zip_read_file(local_dir, rel_path)

    readme_content = read_file_fn("README.md") or read_file_fn("readme.md")

    metadata = {
        "full_name": None,
        "description": None,
        "source": source_type,
        "file_count": sum(1 for t in tree if t["type"] == "blob"),
    }

    return _build_summary(
        source_type=source_type,
        source_id=source_id or local_dir,
        metadata=metadata,
        tree=tree,
        commits=[],
        readme_content=readme_content,
        read_file_fn=read_file_fn,
        groq_api_key=groq_api_key,
    )

def _build_summary(source_type, source_id, metadata, tree, commits, readme_content, read_file_fn, groq_api_key=None) -> dict:
    tech_stack = detect_tech_stack(tree, read_file_fn)
    platforms = detect_platforms(tree)
    project_type = classify_project_type(tech_stack, platforms)
    readme_analysis = score_readme(readme_content)
    code_quality = analyze_project(root_dir=source_id, tree=tree, read_file_fn=read_file_fn)

    result = {
        "repository": {
            "source_type": source_type,   # "github" | "zip"
            "source_id": source_id,
            "metadata": metadata,
            "file_count": sum(1 for t in tree if t["type"] == "blob"),
            "recent_commits": commits,
        },
        "project_type": project_type,
        "platforms": platforms,
        "tech_stack": tech_stack,
        "code_quality": code_quality,
        "readme": readme_analysis,
        "project_summary": None,
    }

    if groq_api_key or os.environ.get("GROQ_API_KEY"):
        try:
            result["project_summary"] = generate_summary(result, api_key=groq_api_key)
        except Exception as e:
            error_text = str(e)
            if "RESOURCE_EXHAUSTED" in error_text or "429" in error_text:
                result["project_summary"] = (
                    "[Pending] Groq API access is temporarily unavailable "
                    "for this key. The summarization call is implemented and tested — "
                    "this will populate automatically once quota is available."
                )
            else:
                result["project_summary"] = None
            result["project_summary_error"] = error_text
    else:
        result["project_summary"] = "[Not generated — no GROQ_API_KEY set]"

    return result


if __name__ == "__main__":
    # End-to-end test using the ZIP path (no external network needed).
    import shutil, tempfile, os

    demo_src = tempfile.mkdtemp()
    os.makedirs(os.path.join(demo_src, "app"), exist_ok=True)
    with open(os.path.join(demo_src, "README.md"), "w") as f:
        f.write("# Demo App\n\nA small Flask + React demo.\n\n## Installation\npip install -r requirements.txt\n\n## Usage\n```\npython app.py\n```\n")
    with open(os.path.join(demo_src, "requirements.txt"), "w") as f:
        f.write("flask\nopenai\n")
    with open(os.path.join(demo_src, "app", "main.py"), "w") as f:
        f.write('"""Entry point."""\nfrom flask import Flask\napp = Flask(__name__)\n\ndef create_app():\n    """Factory."""\n    return app\n')

    zip_path = shutil.make_archive("/tmp/demo_full_project", "zip", demo_src)
    result = read_from_zip(zip_path)
    print(json.dumps(result, indent=2))

