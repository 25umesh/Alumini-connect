# app/auth.py
from fastapi import Header, HTTPException
import os
from .config import FIREBASE_SERVICE_ACCOUNT

# Try to import firebase_admin lazily and tolerate environments where
# dependencies are unavailable (e.g., incompatible Python on Render).
# We'll mark availability based on import + initialization below.
try:  # Import may fail if dependencies are not compatible/installed
    import firebase_admin  # type: ignore
    from firebase_admin import auth as fb_auth  # type: ignore
    from firebase_admin import credentials as fb_credentials  # type: ignore
    _FIREBASE_IMPORTED = True
except Exception:
    firebase_admin = None  # type: ignore[assignment]
    fb_auth = None  # type: ignore[assignment]
    fb_credentials = None  # type: ignore[assignment]
    _FIREBASE_IMPORTED = False

# Dev bypass: set DEV_AUTH_BYPASS=1 to skip Firebase verification locally.
DEV_AUTH_BYPASS = os.getenv("DEV_AUTH_BYPASS", "0") == "1"

# initialize firebase admin once if possible (but only if import succeeded)
FIREBASE_ADMIN_AVAILABLE = False
if _FIREBASE_IMPORTED:
    try:
        if not firebase_admin._apps:  # type: ignore[union-attr]
            # prefer explicit service account file if provided
            if FIREBASE_SERVICE_ACCOUNT and os.path.exists(
                FIREBASE_SERVICE_ACCOUNT
            ):
                cred = fb_credentials.Certificate(  # type: ignore[union-attr]
                    FIREBASE_SERVICE_ACCOUNT
                )
                firebase_admin.initialize_app(cred)  # type: ignore[union-attr]
            else:
                # try default credentials (e.g., GCP environment)
                firebase_admin.initialize_app()  # type: ignore[union-attr]
        FIREBASE_ADMIN_AVAILABLE = True
    except Exception:
        FIREBASE_ADMIN_AVAILABLE = False
else:
    FIREBASE_ADMIN_AVAILABLE = False


def verify_firebase_token(authorization: str = Header(...)):
    """Verify firebase bearer token and return decoded token.

    Local dev: set DEV_AUTH_BYPASS=1 to skip verification and return a
    dummy admin token (uid: 'dev').
    """
    if DEV_AUTH_BYPASS:
        return {"uid": "dev", "admin": True}

    if not FIREBASE_ADMIN_AVAILABLE or fb_auth is None:
        raise HTTPException(
            status_code=503, detail="Firebase admin not initialized"
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    id_token = authorization.split(" ")[1]
    try:
        decoded = fb_auth.verify_id_token(id_token)  # type: ignore[union-attr]
        return decoded
    except Exception as e:
        msg = f"Token verify failed: {e}"
        raise HTTPException(status_code=401, detail=msg)
