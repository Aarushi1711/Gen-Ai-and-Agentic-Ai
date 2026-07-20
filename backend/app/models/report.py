from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    architecture_score = Column(Float, nullable=True)
    scalability_score = Column(Float, nullable=True)
    documentation_score = Column(Float, nullable=True)
    deployment_readiness_score = Column(Float, nullable=True)
    code_quality_score = Column(Float, nullable=True)
    security_score = Column(Float, nullable=True)
    performance_score = Column(Float, nullable=True)
    ai_commentary = Column(Text, nullable=True)
    category_details = Column(Text, nullable=True)  # JSON string: {"Architecture": {"summary": "...", "issues": ["...", "..."]}, ...}
    generated_at = Column(DateTime(timezone=True), server_default=func.now())