# app/routes/students.py
from fastapi import APIRouter, Depends, HTTPException
from ..models import StudentCreate, StudentPatch, ResumeParsePayload
from ..auth import verify_firebase_token
from ..db import create_student_doc, get_student, patch_student
from ..services.resume_service import parse_and_update_student

router = APIRouter(prefix="/scl/students", tags=["students"])


@router.post("", summary="Create student (SCL).")
def create_student(
    payload: StudentCreate,
    token: dict = Depends(verify_firebase_token),
):
    # Only allow college admins (token must have admin claim)
    if not token.get("admin", False):
        raise HTTPException(status_code=403, detail="Not allowed")
    obj = payload.dict()
    created = create_student_doc(obj)
    return {"ok": True, "student": created}
 

@router.get("/{alumni_id}")
def get_student_endpoint(
    alumni_id: str, token: dict = Depends(verify_firebase_token)
):
    student = get_student(alumni_id)
    if not student:
        raise HTTPException(status_code=404, detail="Not found")
    return student
 

@router.patch("/{alumni_id}")
def patch_student_endpoint(
    alumni_id: str,
    patch: StudentPatch,
    token: dict = Depends(verify_firebase_token),
):
    student = get_student(alumni_id)
    if not student:
        raise HTTPException(status_code=404, detail="Not found")
    # if user is the owner (authUid) enforce linkedToCollege
    uid = token.get("uid")
    if uid == student.get("authUid"):
        if not student.get("linkedToCollege", False):
            raise HTTPException(
                status_code=403,
                detail="Profile read-only until linked to college",
            )
    else:
        # allow admin override
        if not token.get("admin", False):
            raise HTTPException(status_code=403, detail="Not allowed")
    # version check and patch
    if patch.version != student.get("version", 1):
        detail = {
            "message": "Version conflict",
            "current_version": student.get("version"),
        }
        raise HTTPException(status_code=409, detail=detail)
    updated = patch_student(alumni_id, patch.changes, token.get("uid"))
    return {"ok": True, "student": updated}


@router.post("/{alumni_id}/parse-resume")
def parse_resume_endpoint(
    alumni_id: str,
    payload: ResumeParsePayload,
    token: dict = Depends(verify_firebase_token),
):
    student = get_student(alumni_id)
    if not student:
        raise HTTPException(status_code=404, detail="Not found")
    uid = token.get("uid")
    # allow owner or admin
    if uid != student.get("authUid") and not token.get("admin", False):
        raise HTTPException(status_code=403, detail="Not allowed")
    result = parse_and_update_student(alumni_id, payload.text, uid)
    return result
