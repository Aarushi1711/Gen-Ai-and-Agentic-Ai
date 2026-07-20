from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    background = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    goals = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    role = Column(String, nullable=True)