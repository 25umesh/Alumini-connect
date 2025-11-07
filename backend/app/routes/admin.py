# app/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException
from app.models import BulkUploadPayload
from app.auth import verify_firebase_token
from app.db import create_student_doc
from app.services.email_service import enqueue_email_job
from app.models import CollegeCreate
from app.db import create_college_doc, link_student_to_college

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/create-bulk")
def create_bulk(
    payload: BulkUploadPayload,
    token: dict = Depends(verify_firebase_token),
):
    if not token.get("admin", False):
        raise HTTPException(status_code=403, detail="Not allowed")
    created = []
    for row in payload.rows:
        row["collegeId"] = payload.collegeId
        s = create_student_doc(row)
        # enqueue onboarding email job
        job = {
            "alumniId": s["alumniId"],
            "collegeId": payload.collegeId,
            "template": "onboarding",
            "vars": {"name": row.get("firstName"), "alumniId": s["alumniId"]},
        }
        enqueue_email_job(job)
        created.append(s["alumniId"])
    return {"ok": True, "createdCount": len(created), "ids": created}


@router.post("/colleges", summary="Create a college record")
def create_college(
    payload: CollegeCreate, token: dict = Depends(verify_firebase_token)
):
    if not token.get("admin", False):
        raise HTTPException(status_code=403, detail="Not allowed")
    obj = payload.dict()
    # optional: record who created the college
    obj["createdBy"] = token.get("uid")
    created = create_college_doc(obj)
    return {"ok": True, "college": created}


@router.post("/link-student", summary="Link an SCL student to a college")
def link_student(
    alumniId: str,
    collegeId: str,
    token: dict = Depends(verify_firebase_token),
):
    if not token.get("admin", False):
        raise HTTPException(status_code=403, detail="Not allowed")
    admin_uid = token.get("uid")
    updated = link_student_to_college(alumniId, collegeId, admin_uid)
    if not updated:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"ok": True, "student": updated}
