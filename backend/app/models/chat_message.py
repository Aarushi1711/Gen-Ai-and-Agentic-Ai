"""
app/models/chat_message.py

Stores every AI Mentor Chat message (both user questions and Aaroh's
answers) so conversations persist and the frontend's chat history /
"Chat Sessions" stat actually reflects real data.

Follows the same style as project.py, repo.py, etc.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    role = Column(String, nullable=False)          # "user" or "assistant"
    content = Column(Text, nullable=False)
    sources = Column(Text, nullable=True)           # comma-separated source filenames, for transparency
    created_at = Column(DateTime(timezone=True), server_default=func.now())