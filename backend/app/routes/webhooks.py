# app/routes/webhooks.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ..auth import verify_firebase_token

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


class RegisterPayload(BaseModel):
    collegeId: str
    url: str
    hmacSecret: str
 

@router.post("/register")
def register_webhook(
    payload: RegisterPayload,
    token: dict = Depends(verify_firebase_token),
):
    if not token.get("admin", False):
        raise HTTPException(status_code=403, detail="Not allowed")
    # Import firestore lazily to avoid crashing if firebase_admin isn't present
    try:
        from firebase_admin import firestore  # type: ignore
        db = firestore.client()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Firestore unavailable: {e}"
        )
    db.collection("webhook_registrations").document(payload.collegeId).set({
        "url": payload.url,
        "hmacSecret": payload.hmacSecret
    })
    return {"ok": True}
