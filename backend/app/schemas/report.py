from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

class CategoryDetail(BaseModel):
    summary: Optional[str] = None
    issues: List[str] = []

class ReportCreate(BaseModel):
    project_id: int
    architecture_score: Optional[float] = None
    scalability_score: Optional[float] = None
    documentation_score: Optional[float] = None
    deployment_readiness_score: Optional[float] = None
    code_quality_score: Optional[float] = None
    security_score: Optional[float] = None
    performance_score: Optional[float] = None
    ai_commentary: Optional[str] = None
    category_details: Optional[Dict[str, CategoryDetail]] = None

class ReportResponse(BaseModel):
    id: int
    project_id: int
    architecture_score: Optional[float]
    scalability_score: Optional[float]
    documentation_score: Optional[float]
    deployment_readiness_score: Optional[float]
    code_quality_score: Optional[float]
    security_score: Optional[float]
    performance_score: Optional[float]
    ai_commentary: Optional[str]
    category_details: Optional[str]  # raw JSON string; frontend parses it
    generated_at: datetime

    class Config:
        from_attributes = True