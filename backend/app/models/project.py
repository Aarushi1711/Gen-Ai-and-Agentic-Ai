from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    idea_description = Column(Text, nullable=True)      # the text idea
    input_type = Column(String, nullable=False)          # "text", "voice", "github", "zip"
    github_url = Column(String, nullable=True)
    zip_filename = Column(String, nullable=True)
    timeline = Column(String, nullable=True)             # e.g. "2 weeks", "1 month"
    created_at = Column(DateTime(timezone=True), server_default=func.now())