from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from firebase_admin import auth as firebase_auth
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    try:
        # 1. Create the user in Firebase
        firebase_user = firebase_auth.create_user(
            email=request.email,
            password=request.password,
            display_name=request.name
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Save a matching record in our own Postgres database
    new_user = User(
        firebase_uid=firebase_user.uid,
        email=request.email,
        name=request.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "firebase_uid": firebase_user.uid,
        "user_id": new_user.id
    }