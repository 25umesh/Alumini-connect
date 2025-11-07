# app/auth.py
from fastapi import Header, HTTPException
import os
import firebase_admin
from firebase_admin import auth, credentials
from .config import FIREBASE_SERVICE_ACCOUNT

# Dev bypass: set DEV_AUTH_BYPASS=1 to skip Firebase verification locally.
DEV_AUTH_BYPASS = os.getenv("DEV_AUTH_BYPASS", "0") == "1"

# initialize firebase admin once if possible
FIREBASE_ADMIN_AVAILABLE = False
if not firebase_admin._apps:
    try:
        # prefer explicit service account file if provided
        if FIREBASE_SERVICE_ACCOUNT and os.path.exists(
            FIREBASE_SERVICE_ACCOUNT
        ):
            cred = credentials.Certificate(
                FIREBASE_SERVICE_ACCOUNT
            )
            firebase_admin.initialize_app(cred)
            FIREBASE_ADMIN_AVAILABLE = True
        else:
            # try default credentials (e.g., GCP environment)
            try:
                firebase_admin.initialize_app()
                FIREBASE_ADMIN_AVAILABLE = True
            except Exception:
                FIREBASE_ADMIN_AVAILABLE = False
    except Exception:
        FIREBASE_ADMIN_AVAILABLE = False


def verify_firebase_token(authorization: str = Header(...)):
    """Verify firebase bearer token and return decoded token.

    Local dev: set DEV_AUTH_BYPASS=1 to skip verification and return a
    dummy admin token (uid: 'dev').
    """
    if DEV_AUTH_BYPASS:
        return {"uid": "dev", "admin": True}

    if not FIREBASE_ADMIN_AVAILABLE:
        raise HTTPException(
            status_code=503, detail="Firebase admin not initialized"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    id_token = authorization.split(" ")[1]
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        msg = f"Token verify failed: {e}"
        raise HTTPException(status_code=401, detail=msg)
