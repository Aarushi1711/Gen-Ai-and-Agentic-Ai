from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RepoCreate(BaseModel):
    project_id: int
    source_type: str
    source_url: Optional[str] = None
    detected_languages: Optional[str] = None
    detected_frameworks: Optional[str] = None
    dependencies: Optional[str] = None
    architecture_pattern: Optional[str] = None

class RepoResponse(BaseModel):
    id: int
    project_id: int
    source_type: str
    source_url: Optional[str]
    detected_languages: Optional[str]
    detected_frameworks: Optional[str]
    dependencies: Optional[str]
    architecture_pattern: Optional[str]
    analyzed_at: datetime

    class Config:
        from_attributes = True