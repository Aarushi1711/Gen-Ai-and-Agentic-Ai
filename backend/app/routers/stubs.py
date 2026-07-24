from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter(tags=["Stubs - Not Yet Implemented"])


@router.post("/upload/text")
def upload_text(current_user: dict = Depends(get_current_user)):
    return {"status": "not_implemented", "message": "Text upload analysis pending Member D's work"}


@router.post("/upload/voice")
def upload_voice(current_user: dict = Depends(get_current_user)):
    return {"status": "not_implemented", "message": "Voice input pending future implementation"}


@router.get("/upload/status/{job_id}")
def upload_status(job_id: str, current_user: dict = Depends(get_current_user)):
    return {"job_id": job_id, "status": "not_implemented"}


@router.get("/ai/analyze/{project_id}")
def ai_analyze(project_id: int, current_user: dict = Depends(get_current_user)):
    return {"status": "not_implemented", "message": "AI analysis pending Member C's work"}


@router.get("/report/{project_id}/pdf")
def get_report_pdf(project_id: int, current_user: dict = Depends(get_current_user)):
    return {"status": "not_implemented", "message": "PDF export pending future implementation"}


@router.post("/contact")
def contact_send():
    return {"status": "not_implemented", "message": "Contact form pending future implementation"}
