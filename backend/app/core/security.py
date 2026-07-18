from fastapi import Header, HTTPException
from app.core.firebase import verify_firebase_token

def get_current_user(authorization: str = Header(...)):
    """
    Expects a header like: Authorization: Bearer <firebase_id_token>
    Verifies the token and returns the decoded user info.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]

    try:
        decoded_token = verify_firebase_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return decoded_token