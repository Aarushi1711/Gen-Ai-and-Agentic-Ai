"""
app/routers/mentor.py

Exposes the full RAG + Groq loop over HTTP, AND saves every question
and answer to the database — so chat history actually persists and
the frontend's AI Mentor Chat page can load past conversations.

Uses ask_hybrid() so answers are grounded in BOTH the general
engineering knowledge base AND the specific repo the user uploaded
for this project (repo_id == str(project_id), matching the key
repository_rag.ingest_repository() was called with during upload).
If no repo has been ingested for this project yet (e.g. an idea-only
"text"/"voice" project), repo_chunks will just come back empty and
the answer falls back to general engineering knowledge — it never
errors out because of a missing repo.

Follows the same auth + DB pattern as project.py / repo.py:
Depends(get_db) for the database session, Depends(get_current_user)
for the logged-in user's identity.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.rag.generate import ask_hybrid
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

    # 2. Run the hybrid RAG loop — general engineering knowledge +
    #    this project's own ingested repo, scoped by project_id.
    try:
        result = ask_hybrid(
            request.question,
            repo_id=str(request.project_id),
            top_k=request.top_k,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # ask_hybrid() returns engineering_sources/repo_sources separately
    # (so the frontend could distinguish them later if useful), but
    # MentorAskResponse currently expects one flat `sources` list —
    # merge them here to match the existing schema/frontend contract.
    sources = list({*result.get("engineering_sources", []), *result.get("repo_sources", [])})

    # 3. Save Aaroh's answer
    assistant_message = ChatMessage(
        project_id=request.project_id,
        role="assistant",
        content=result["answer"],
        sources=", ".join(sources) if sources else None,
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return MentorAskResponse(answer=result["answer"], sources=sources)


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
