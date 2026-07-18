from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Repo(Base):
    __tablename__ = "repos"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    source_type = Column(String, nullable=False)          # "github" or "zip"
    source_url = Column(String, nullable=True)             # GitHub URL if applicable
    detected_languages = Column(Text, nullable=True)       # e.g. "Python,JavaScript"
    detected_frameworks = Column(Text, nullable=True)      # e.g. "FastAPI,React"
    dependencies = Column(Text, nullable=True)              # raw list, JSON string for now
    architecture_pattern = Column(String, nullable=True)    # e.g. "MVC", "microservices"
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())