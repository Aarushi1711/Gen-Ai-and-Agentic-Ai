"""
app/routers/mentor.py

Single entry point for the AI Mentor Chat. Calls ask_planner() — NOT
any individual RAG function directly — so every route (general, repo,
ui_ux, architecture, report) is reachable from the frontend through
one endpoint. Saves every question and answer to the database so
chat history persists.
"""

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.agents.planner import ask_planner
from app.models.chat_message import ChatMessage
from app.models.project import Project
from app.models.repo import Repo
from app.schemas.mentor import MentorAskRequest, MentorAskResponse

router = APIRouter(prefix="/api/mentor", tags=["mentor"])


@router.post("/ask", response_model=MentorAskResponse)
def ask(
    request: MentorAskRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Resolve repo_id: use whatever the request explicitly passes, else
    # look up the repo linked to this project.
    repo_id = request.repo_id
    if not repo_id:
        repo = db.query(Repo).filter(Repo.project_id == request.project_id).first()
        repo_id = repo.repo_identifier if repo else None
        # ^ swap "repo_identifier" for whatever column on Repo actually
        # holds the string used in ingest_repository()/retrieve_repository_knowledge()

    # 1. Save the user's question
    user_message = ChatMessage(
        project_id=request.project_id,
        role="user",
        content=request.question,
    )
    db.add(user_message)
    db.commit()

    # 2. Run the Planner — this is the actual routing + RAG loop
    try:
        result = ask_planner(request.question, repo_id=repo_id)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 3. Save the answer. For architecture/report routes, `data` holds
    # the structured graph/scores — appended as a JSON comment so it
    # survives in chat history without changing the ChatMessage schema.
    stored_content = result["answer"]
    if result.get("data"):
        stored_content += f"\n\n<!--data:{json.dumps(result['data'])}-->"

    assistant_message = ChatMessage(
        project_id=request.project_id,
        role="assistant",
        content=stored_content,
        sources=", ".join(result["sources"]) if result["sources"] else None,
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return MentorAskResponse(
        answer=result["answer"],
        sources=result["sources"],
        route_used=result["route_used"],
        data=result.get("data"),
    )


@router.get("/history/{project_id}")
def get_chat_history(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Lets the frontend load past messages when the AI Mentor Chat page opens."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.project_id == project_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [
        {
            "role": m.role,
            "content": m.content,
            "sources": m.sources,
            "created_at": m.created_at,
        }
        for m in messages
    ]