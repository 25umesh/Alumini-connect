"""Bulk email route.

Allows a school or college user to send an email to all their students.
Admins (token.admin == True) may specify targetId explicitly for either scope.
Non-admin callers default to token uid for school scope.
"""
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from app.auth import verify_firebase_token
from app.models import BulkEmailRequest
from app.services.email_service import send_bulk_emails

router = APIRouter(prefix="/bulk-email", tags=["bulk-email"])


@router.post("", summary="Send bulk email to students for a school or college")
def send_bulk(
    payload: BulkEmailRequest,
    token: dict = Depends(verify_firebase_token),
):
    scope = payload.scope.lower()
    if scope not in ("school", "college"):
        raise HTTPException(status_code=400, detail="Invalid scope")

    # Determine target id (schoolId / collegeId)
    is_admin = token.get("admin", False)
    target_id = (
        payload.targetId if (is_admin and payload.targetId)
        else token.get("uid")
    )
    if not target_id:
        raise HTTPException(status_code=400, detail="Missing targetId")

    db = firestore.client()
    collection = db.collection("scl_students")
    field = "schoolId" if scope == "school" else "collegeId"

    # Query for matching students
    query = collection.where(field, "==", target_id)
    docs = list(query.stream())
    seen = set()
    emails = []
    for d in docs:
        data = d.to_dict() or {}
        e = data.get("email")
        if e and e not in seen:
            seen.add(e)
            emails.append(e)

    if payload.previewOnly:
        return {
            "ok": True,
            "preview": {
                "recipientCount": len(emails),
                "emails": emails[:50],  # limit echo
            },
        }

    if not emails:
        return {"ok": False, "message": "No recipient emails found"}

    # Send
    try:
        resp = send_bulk_emails(
            emails,
            subject=payload.subject.strip(),
            plain_text=payload.body,
            html_text=payload.htmlBody,
        )
        return {
            "ok": True,
            "sent": len(emails),
            "status": resp.get("status"),
            "skipped": len(docs) - len(emails),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk send failed: {e}")
