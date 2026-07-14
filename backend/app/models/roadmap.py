from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    milestone_title = Column(String, nullable=False)
    milestone_description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False)        # 1, 2, 3... to keep milestones in order
    created_at = Column(DateTime(timezone=True), server_default=func.now())