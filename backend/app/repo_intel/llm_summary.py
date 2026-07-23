"""
llm_summary.py
--------------
Takes the JSON built by repo_reader.py and makes ONE call to Groq
(the fast-inference company at console.groq.com — NOT xAI's Grok)
to turn it into a plain-English project summary.

Needs: pip install openai   (Groq's API is OpenAI-compatible, so we
       reuse the standard OpenAI Python client pointed at Groq's servers)
Needs: a free Groq API key from https://console.groq.com — no card needed.
"""

import json
import os
from openai import OpenAI

GROQ_BASE_URL = "https://api.groq.com/openai/v1"

# Free-tier candidates on Groq, tried in order in case one gets retired.
# Check https://console.groq.com/docs/models for the current lineup.
CANDIDATE_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gpt-oss-120b",
]


def build_prompt(analysis: dict) -> str:
    """Turns the raw JSON into a compact prompt (we don't send everything —
    just the parts a human summary actually needs)."""
    repo = analysis["repository"]
    tech = [t["name"] for t in analysis["tech_stack"]]
    readme = analysis["readme"]
    quality = analysis["code_quality"]

    return f"""You are summarizing a student's coding project for a project mentor tool.
Write a short, plain-English summary (4-6 sentences) covering: what the
project likely does, what tech stack it uses, and one honest observation
about code/documentation quality. Be encouraging but factual — no fluff.

Project type (already detected, trust this): {analysis.get('project_type')}
Target platforms: {analysis.get('platforms')}
Repository info: {json.dumps(repo['metadata'])}
Detected tech stack: {tech}
README quality score: {readme.get('score')}/100 (exists: {readme.get('exists')})
Code stats: {quality['python_files_analyzed']} Python files analyzed,
{quality['total_functions']} functions, {quality['total_classes']} classes,
average docstring coverage: {quality['avg_docstring_coverage_pct']}%

Write only the summary text, no headers or bullet points."""


def generate_summary(analysis: dict, api_key: str | None = None) -> str:
    """
    api_key: pass directly, or set the GROQ_API_KEY environment variable
    and leave this as None (recommended — keeps the key out of your code).
    """
    api_key = api_key or os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "No Groq API key found. Set it with:\n"
            "  setx GROQ_API_KEY \"your-key-here\"   (Windows, then restart terminal)\n"
            "or pass api_key='...' directly."
        )

    client = OpenAI(api_key=api_key, base_url=GROQ_BASE_URL)
    prompt = build_prompt(analysis)

    last_error = None
    for model_name in CANDIDATE_MODELS:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            last_error = e
            continue

    raise last_error


if __name__ == "__main__":
    # Test with FAKE analysis data first (no API key needed) to confirm
    # the prompt builds correctly before spending a real API call.
    fake_analysis = {
        "repository": {"metadata": {"full_name": "demo/project", "description": "A demo app"}},
        "tech_stack": [{"name": "Flask"}, {"name": "Python"}],
        "readme": {"score": 83, "exists": True},
        "code_quality": {
            "python_files_analyzed": 1,
            "total_functions": 1,
            "total_classes": 0,
            "avg_docstring_coverage_pct": 100,
        },
    }
    print("=== PROMPT THAT WOULD BE SENT ===")
    print(build_prompt(fake_analysis))

    print("\n=== LIVE CALL (only runs if GROQ_API_KEY is set) ===")
    if os.environ.get("GROQ_API_KEY"):
        print(generate_summary(fake_analysis))
    else:
        print("Skipped — no GROQ_API_KEY set in this environment. That's expected here.")
