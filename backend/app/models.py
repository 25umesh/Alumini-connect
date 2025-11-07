# app/models.py
from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class StudentCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = None
    graduationYear: Optional[int] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    rollNumber: Optional[str] = None
    collegeId: Optional[str] = None


class StudentPatch(BaseModel):
    changes: Dict[str, Any]
    version: int


class BulkUploadPayload(BaseModel):
    rows: List[Dict[str, Any]]
    collegeId: str


class OnboardVerify(BaseModel):
    token: str


class CollegeCreate(BaseModel):
    name: str
    domain: Optional[str] = None
    contactEmail: Optional[str] = None
    address: Optional[str] = None


class College(BaseModel):
    collegeId: str
    name: str
    domain: Optional[str] = None
    contactEmail: Optional[str] = None
    address: Optional[str] = None
    adminUid: Optional[str] = None


class ResumeParsePayload(BaseModel):
    text: str


class BulkEmailRequest(BaseModel):
    """Payload for bulk email trigger.

    subject: Email subject line chosen by school/college admin.
    body: Plain text body (HTML optional via htmlBody).
    scope: Either 'school' or 'college' indicating which field to filter on.
    targetId: Optional explicit target id (allowed only for admin tokens);
              if omitted, and caller is not admin, will default to token uid.
              Admins can specify a schoolId or collegeId depending on scope.
    htmlBody: Optional HTML content; if provided will be sent as HTML.
    previewOnly: If true, returns the list of recipient emails without sending.
    """
    subject: str
    body: str
    scope: str  # 'school' | 'college'
    targetId: Optional[str] = None
    htmlBody: Optional[str] = None
    previewOnly: bool = False
