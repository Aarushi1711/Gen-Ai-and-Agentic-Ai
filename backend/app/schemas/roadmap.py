from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RoadmapCreate(BaseModel):
    project_id: int
    milestone_title: str
    milestone_description: Optional[str] = None
    order_index: int

class RoadmapResponse(BaseModel):
    id: int
    project_id: int
    milestone_title: str
    milestone_description: Optional[str]
    order_index: int
    created_at: datetime

    class Config:
        from_attributes = True