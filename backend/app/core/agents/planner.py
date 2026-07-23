"""
app/core/agents/planner.py

Master router: takes a question (+ optional repo_id), classifies intent
via keyword matching (no LLM call needed for this step), and routes to
the correct RAG/agent function. This is the single entry point every
other part of the app should call — routers should never call
ask_mentor_smart() / generate_architecture_graph() etc. directly.
"""

from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END

from app.core.rag.generate import ask_mentor_smart, ask_about_repo, ask_ui_ux_review
from app.core.agents.architecture_agent import generate_architecture_graph
from app.core.rag.report_generator import generate_project_report


class PlannerState(TypedDict):
    question: str
    repo_id: Optional[str]
    route: Optional[str]
    answer: Optional[str]
    sources: Optional[list]
    data: Optional[dict]  # non-null only for architecture/report routes


_ARCHITECTURE_SIGNALS = [
    "architecture diagram", "show my architecture", "visualize my",
    "architecture graph", "system diagram", "how are the pieces connected",
]
_REPORT_SIGNALS = [
    "health score", "health report", "how healthy is my project",
    "generate a report", "score my project", "project health",
]
_UI_UX_SIGNALS = [
    "ui", "ux", "design", "layout", "component", "frontend look",
    "user interface", "user experience", "styling", "css", "tailwind",
]
_REPO_SIGNALS = [
    "my code", "my repo", "my project", "this file", "this function",
    "review my", "my backend", "my auth", "bug in my", "explain this",
    "my implementation", "my repository",
]


def _classify(state: PlannerState) -> PlannerState:
    question = state["question"].lower()

    if any(w in question for w in _ARCHITECTURE_SIGNALS):
        state["route"] = "architecture"
    elif any(w in question for w in _REPORT_SIGNALS):
        state["route"] = "report"
    elif any(w in question for w in _UI_UX_SIGNALS):
        state["route"] = "ui_ux"
    elif state.get("repo_id") and any(w in question for w in _REPO_SIGNALS):
        state["route"] = "repo"
    else:
        state["route"] = "general"

    return state


def _answer_general(state: PlannerState) -> PlannerState:
    result = ask_mentor_smart(state["question"])
    state["answer"] = result["answer"]
    state["sources"] = result["sources"]
    return state


def _answer_repo(state: PlannerState) -> PlannerState:
    result = ask_about_repo(state["question"], state["repo_id"])
    state["answer"] = result["answer"]
    state["sources"] = result["sources"]
    return state


def _answer_ui_ux(state: PlannerState) -> PlannerState:
    result = ask_ui_ux_review(state["question"], state.get("repo_id"))
    state["answer"] = result["answer"]
    state["sources"] = result["guideline_sources"] + result["code_sources"]
    return state


def _answer_architecture(state: PlannerState) -> PlannerState:
    if not state.get("repo_id"):
        state["answer"] = "I need a repository to analyze first — please upload or connect your project."
        state["sources"] = []
        return state
    graph = generate_architecture_graph(state["repo_id"])
    state["data"] = graph
    state["answer"] = f"Here's your architecture diagram — {len(graph.get('nodes', []))} components identified."
    state["sources"] = []
    return state


def _answer_report(state: PlannerState) -> PlannerState:
    if not state.get("repo_id"):
        state["answer"] = "I need a repository to analyze first — please upload or connect your project."
        state["sources"] = []
        return state
    report = generate_project_report(state["repo_id"])
    state["data"] = report
    state["answer"] = report.get("ai_commentary", "Report generated.")
    state["sources"] = []
    return state


def _route_decision(state: PlannerState) -> str:
    return state["route"]


def _build_graph():
    graph = StateGraph(PlannerState)
    graph.add_node("classify", _classify)
    graph.add_node("answer_general", _answer_general)
    graph.add_node("answer_repo", _answer_repo)
    graph.add_node("answer_ui_ux", _answer_ui_ux)
    graph.add_node("answer_architecture", _answer_architecture)
    graph.add_node("answer_report", _answer_report)

    graph.set_entry_point("classify")
    graph.add_conditional_edges(
        "classify",
        _route_decision,
        {
            "general": "answer_general",
            "repo": "answer_repo",
            "ui_ux": "answer_ui_ux",
            "architecture": "answer_architecture",
            "report": "answer_report",
        },
    )
    graph.add_edge("answer_general", END)
    graph.add_edge("answer_repo", END)
    graph.add_edge("answer_ui_ux", END)
    graph.add_edge("answer_architecture", END)
    graph.add_edge("answer_report", END)

    return graph.compile()


_agent = None


def get_agent():
    global _agent
    if _agent is None:
        _agent = _build_graph()
    return _agent


def ask_planner(question: str, repo_id: str = None) -> dict:
    agent = get_agent()
    result = agent.invoke({"question": question, "repo_id": repo_id})
    return {
        "answer": result["answer"],
        "sources": result.get("sources", []),
        "route_used": result["route"],
        "data": result.get("data"),
    }