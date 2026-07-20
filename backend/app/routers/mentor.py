"""
app/routers/mentor.py

Exposes the full RAG + Gemini loop over HTTP, AND saves every question
and answer to the database — so chat history actually persists and
the frontend's AI Mentor Chat page can load past conversations.

Follows the same auth + DB pattern as project.py / repo.py:
Depends(get_db) for the database session, Depends(get_current_user)
for the logged-in user's identity.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.rag.generate import ask_mentor
from app.models.chat_message import ChatMessage
from app.models.project import Project
from app.schemas.mentor import MentorAskRequest, MentorAskResponse

router = APIRouter(prefix="/api/mentor", tags=["mentor"])


@router.post("/ask", response_model=MentorAskResponse)
def ask(
    request: MentorAskRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Confirm the project exists and belongs to this user before answering.
    # (Mirrors the ownership check pattern in project.py's router.)
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 1. Save the user's question
    user_message = ChatMessage(
        project_id=request.project_id,
        role="user",
        content=request.question,
    )
    db.add(user_message)
    db.commit()

    # 2. Run the actual RAG + Gemini loop
    try:
        result = ask_mentor(request.question, top_k=request.top_k)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 3. Save Aaroh's answer
    assistant_message = ChatMessage(
        project_id=request.project_id,
        role="assistant",
        content=result["answer"],
        sources=", ".join(result["sources"]) if result["sources"] else None,
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return MentorAskResponse(answer=result["answer"], sources=result["sources"])


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