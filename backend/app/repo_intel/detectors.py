"""
detectors.py
------------
Signal-based detection: framework/tech-stack AND overall project type
(web app, mobile app, data science, game, CLI tool, etc.) from files
present in the tree, plus a lightweight README quality score.

Works off the {"path": ..., "type": ..., "size": ...} tree shape shared
by both GitHub and ZIP sources.
"""

# ---------------------------------------------------------------------------
# Filename/path-based signals. Key = a path SUFFIX to look for anywhere in
# the tree (so nested files like "android/app/build.gradle" still match
# "build.gradle"). Value = list of (label, category) it implies.
# ---------------------------------------------------------------------------
FRAMEWORK_SIGNALS = {
    # --- web / general ---
    "package.json": [("Node.js", "runtime")],
    "requirements.txt": [("Python", "language")],
    "pyproject.toml": [("Python", "language")],
    "manage.py": [("Django", "backend_framework")],
    "next.config.js": [("Next.js", "frontend_web_framework")],
    "next.config.ts": [("Next.js", "frontend_web_framework")],
    "angular.json": [("Angular", "frontend_web_framework")],
    "vue.config.js": [("Vue.js", "frontend_web_framework")],
    "vite.config.js": [("Vite", "build_tool")],
    "vite.config.ts": [("Vite", "build_tool")],
    "tsconfig.json": [("TypeScript", "language")],
    ".streamlit/config.toml": [("Streamlit", "frontend_web_framework")],

    # --- backend / other languages ---
    "pom.xml": [("Maven / Java", "backend_framework")],
    "build.gradle": [("Gradle / Java", "backend_framework")],
    "build.gradle.kts": [("Gradle / Kotlin", "backend_framework")],
    "go.mod": [("Go", "language")],
    "Cargo.toml": [("Rust", "language")],
    "Gemfile": [("Ruby", "language")],
    "composer.json": [("PHP", "language")],
    "artisan": [("Laravel", "backend_framework")],

    # --- devops ---
    "Dockerfile": [("Docker", "devops")],
    "docker-compose.yml": [("Docker Compose", "devops")],

    # --- mobile: Flutter ---
    "pubspec.yaml": [("Flutter", "mobile_framework"), ("Dart", "language")],

    # --- mobile: native Android ---
    "AndroidManifest.xml": [("Android (native)", "mobile_native")],
    "MainActivity.kt": [("Kotlin", "language")],
    "MainActivity.java": [("Java", "language")],

    # --- mobile: native iOS ---
    "Info.plist": [("iOS (native)", "mobile_native")],
    "Podfile": [("CocoaPods / iOS", "mobile_native")],
    "AppDelegate.swift": [("Swift", "language")],

    # --- mobile: cross-platform via config files ---
    "capacitor.config.json": [("Capacitor / Ionic", "mobile_framework")],
    "capacitor.config.ts": [("Capacitor / Ionic", "mobile_framework")],
    "app.json": [("Expo (React Native)", "mobile_framework")],

    # --- desktop ---
    "tauri.conf.json": [("Tauri", "desktop_framework")],

    # --- data science / ML ---
    ".ipynb": [("Jupyter Notebook", "data_science")],

    # --- games ---
    "project.godot": [("Godot", "game_engine")],
    "ProjectVersion.txt": [("Unity", "game_engine")],
}

# Folder-name hints that confirm a target platform even for cross-platform
# frameworks (Flutter/React Native projects both have android/ + ios/ folders).
PLATFORM_FOLDER_HINTS = {
    "/android/": "Android",
    "/ios/": "iOS",
}

# content-based checks for package.json / requirements.txt / pubspec.yaml.
# Order matters: more specific keywords (e.g. "react-native") are checked
# before generic ones (e.g. "react") so a React Native project isn't also
# mislabeled as a plain web React app.
DEPENDENCY_HINTS = [
    ("react-native", "React Native", "mobile_framework"),
    ("expo", "Expo (React Native)", "mobile_framework"),
    ("flutter", "Flutter", "mobile_framework"),
    ("react", "React", "frontend_web_framework"),
    ("flask", "Flask", "backend_framework"),
    ("django", "Django", "backend_framework"),
    ("fastapi", "FastAPI", "backend_framework"),
    ("express", "Express.js", "backend_framework"),
    ("langgraph", "LangGraph", "ai_framework"),
    ("langchain", "LangChain", "ai_framework"),
    ("groq", "Groq API", "ai_framework"),
    ("openai", "OpenAI-compatible API client", "ai_framework"),
    ("google-generativeai", "Gemini API", "ai_framework"),
    ("firebase", "Firebase", "backend_framework"),
    ("tailwindcss", "Tailwind CSS", "styling"),
    ("electron", "Electron", "desktop_framework"),
    ("pandas", "pandas", "data_science"),
    ("numpy", "NumPy", "data_science"),
    ("scikit-learn", "scikit-learn", "data_science"),
    ("tensorflow", "TensorFlow", "data_science"),
    ("torch", "PyTorch", "data_science"),
]


def detect_tech_stack(tree: list, read_file_fn) -> list:
    """
    tree: [{"path", "type", "size"}, ...]
    read_file_fn: callable(rel_path) -> str | None
    Returns a de-duplicated list of {"name", "category", "confidence", "evidence"}.
    """
    found = {}
    paths = [item["path"] for item in tree if item["type"] in ("blob", "file")]

    # 1. filename/path-suffix signals (nested-path aware)
    for suffix, signals in FRAMEWORK_SIGNALS.items():
        match = next((p for p in paths if p == suffix or p.endswith("/" + suffix) or p.endswith(suffix)), None)
        if match:
            for name, category in signals:
                found.setdefault(name, {"name": name, "category": category, "confidence": "high", "evidence": match})

    # 2. dependency-content signals
    matched_keywords = set()
    for keyword, name, category in DEPENDENCY_HINTS:
        if any(keyword in mk for mk in matched_keywords):
            continue
        for fname in ("package.json", "requirements.txt", "pyproject.toml", "pubspec.yaml"):
            rel = next((p for p in paths if p == fname or p.endswith("/" + fname)), None)
            if not rel:
                continue
            content = read_file_fn(rel)
            if not content:
                continue
            if keyword in content.lower():
                matched_keywords.add(keyword)
                found.setdefault(name, {"name": name, "category": category, "confidence": "medium", "evidence": f"found in {rel}"})

    return sorted(found.values(), key=lambda x: (x["category"], x["name"]))


def detect_platforms(tree: list) -> list:
    """Detects target platforms (Android/iOS) from folder structure."""
    paths = ["/" + item["path"].lower() + "/" for item in tree]
    platforms = set()
    for hint_path, label in PLATFORM_FOLDER_HINTS.items():
        if any(hint_path in p for p in paths):
            platforms.add(label)
    return sorted(platforms)


def classify_project_type(tech_stack: list, platforms: list) -> str:
    """Turns detected categories into one human-readable project type."""
    categories = {t["category"] for t in tech_stack}

    is_mobile = bool(categories & {"mobile_framework", "mobile_native"}) or bool(platforms)
    is_web_frontend = "frontend_web_framework" in categories
    is_backend = "backend_framework" in categories
    is_data_science = "data_science" in categories
    is_desktop = "desktop_framework" in categories
    is_game = "game_engine" in categories

    if is_mobile:
        platform_str = f" ({', '.join(platforms)})" if platforms else ""
        return f"Mobile App{platform_str}"
    if is_game:
        return "Game"
    if is_desktop:
        return "Desktop App"
    if is_data_science and not is_web_frontend and not is_backend:
        return "Data Science / ML Project"
    if is_web_frontend and is_backend:
        return "Full-stack Web App"
    if is_web_frontend:
        return "Frontend Web App"
    if is_backend:
        return "Backend / API Project"
    return "Unclear — insufficient signals detected"


def score_readme(readme_content) -> dict:
    """Lightweight, explainable README quality score (0-100)."""
    if not readme_content or not readme_content.strip():
        return {"exists": False, "score": 0, "checks": {}}

    text = readme_content
    lower = text.lower()
    checks = {
        "has_title": text.strip().startswith("#"),
        "has_description": len(text.strip()) > 100,
        "has_installation_section": any(k in lower for k in ["install", "setup", "getting started"]),
        "has_usage_section": any(k in lower for k in ["usage", "how to run", "example"]),
        "has_code_block": "```" in text,
        "reasonable_length": len(text) > 300,
    }
    score = round(100 * sum(checks.values()) / len(checks))
    return {"exists": True, "score": score, "length_chars": len(text), "checks": checks}


if __name__ == "__main__":
    # self-test: a fake React Native project should NOT be mislabeled as a
    # plain web app, and platforms should be picked up from folder names.
    fake_tree = [
        {"path": "package.json", "type": "blob", "size": 300},
        {"path": "android/app/build.gradle", "type": "blob", "size": 100},
        {"path": "ios/Podfile", "type": "blob", "size": 50},
        {"path": "App.js", "type": "blob", "size": 900},
    ]
    fake_files = {
        "package.json": '{"dependencies": {"react-native": "0.74.0", "expo": "^51.0.0"}}',
    }
    stack = detect_tech_stack(fake_tree, lambda p: fake_files.get(p))
    platforms = detect_platforms(fake_tree)
    print("Detected stack:", stack)
    print("Platforms:", platforms)
    print("Project type:", classify_project_type(stack, platforms))
