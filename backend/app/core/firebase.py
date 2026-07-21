import json
import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings

firebase_json = settings.firebase_credentials_json

if firebase_json:
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
else:
    cred = credentials.Certificate("firebase-credentials.json")

firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token: str):
    decoded_token = auth.verify_id_token(id_token)
    return decoded_token