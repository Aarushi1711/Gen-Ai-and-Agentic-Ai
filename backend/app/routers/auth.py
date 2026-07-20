from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import requests
from firebase_admin import auth as firebase_auth
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.auth import SignupRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

FIREBASE_WEB_API_KEY = "AIzaSyCa1RNOmzcT1AqI9zadKBfrK9kHFLLsp_w"  # move to env var later


@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # current_user["uid"] comes from the verified Firebase token — no need to create the user again
    new_user = User(
        firebase_uid=current_user["uid"],
        email=current_user.get("email", request.email),
        name=request.name,
        role=request.role
        
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "firebase_uid": new_user.firebase_uid,
        "user_id": new_user.id
    }

@router.post("/login")
def login(email: str, password: str):
    """
    Real login: verifies email/password against Firebase and returns a token,
    using Firebase's REST API under the hood (Admin SDK can't check passwords directly).
    """
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
    payload = {"email": email, "password": password, "returnSecureToken": True}

    response = requests.post(url, json=payload)

    if response.status_code != 200:
        error_msg = response.json().get("error", {}).get("message", "Login failed")
        raise HTTPException(status_code=401, detail=error_msg)

    data = response.json()
    return {
        "id_token": data["idToken"],
        "refresh_token": data["refreshToken"],
        "expires_in": data["expiresIn"],
        "uid": data["localId"],
        "email": data["email"],
    }


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    """
    Revokes all refresh tokens for this user, forcing their existing tokens
    to expire early. The frontend should also clear its locally stored token.
    """
    firebase_auth.revoke_refresh_tokens(current_user["uid"])
    return {"message": "Logged out successfully"}


@router.get("/me")
def read_current_user(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_user = db.query(User).filter(User.firebase_uid == current_user["uid"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": db_user.id,
        "email": db_user.email,
        "name": db_user.name,
        "role": db_user.role,
        "background": db_user.background,
        "skills": db_user.skills,
        "goals": db_user.goals,
    }