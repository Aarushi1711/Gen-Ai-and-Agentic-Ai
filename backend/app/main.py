from fastapi import FastAPI, Depends
from sqlalchemy import text
from app.core.database import engine, Base
from app.core.security import get_current_user
from app.models import user, project, repo, report, roadmap
from app.routers import project as project_router, auth as auth_router, repo as repo_router, report as report_router, roadmap as roadmap_router

app = FastAPI(title="Aaroh AI Backend")

Base.metadata.create_all(bind=engine)

app.include_router(project_router.router)
app.include_router(auth_router.router)
app.include_router(repo_router.router)
app.include_router(report_router.router)
app.include_router(roadmap_router.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/db-check")
def db_check():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"database": "connected"}

@app.get("/me")
def read_current_user(current_user: dict = Depends(get_current_user)):
    return {"uid": current_user["uid"], "email": current_user.get("email")}