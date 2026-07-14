import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token: str):
    """Verifies a Firebase ID token and returns the decoded user info."""
    decoded_token = auth.verify_id_token(id_token)
    return decoded_token