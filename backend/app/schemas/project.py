from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str
    idea_description: Optional[str] = None
    input_type: str
    github_url: Optional[str] = None
    zip_filename: Optional[str] = None
    timeline: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    idea_description: Optional[str]
    input_type: str
    github_url: Optional[str]
    zip_filename: Optional[str]
    timeline: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True