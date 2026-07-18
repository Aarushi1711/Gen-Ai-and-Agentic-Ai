from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    project_id: int
    architecture_score: Optional[float] = None
    scalability_score: Optional[float] = None
    documentation_score: Optional[float] = None
    deployment_readiness_score: Optional[float] = None
    ai_commentary: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    project_id: int
    architecture_score: Optional[float]
    scalability_score: Optional[float]
    documentation_score: Optional[float]
    deployment_readiness_score: Optional[float]
    ai_commentary: Optional[str]
    generated_at: datetime

    class Config:
        from_attributes = True