import re
from typing import Dict, Any, List
import logging
from ..db import patch_student

log = logging.getLogger(__name__)

# Very small, rule-based resume parser. This is intentionally lightweight so
# it has no heavy dependencies. For production, replace/extend with an ML API
# or a dedicated resume parsing library.

YEAR_RE = re.compile(r"\b(19|20)\d{2}\b")
SKILL_KEYWORDS = [
    "python",
    "java",
    "c++",
    "c#",
    "javascript",
    "typescript",
    "react",
    "node",
    "django",
    "flask",
    "sql",
    "postgres",
    "mysql",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
]

COURSE_KEYWORDS = [
    "btech",
    "b.e.",
    "b.e",
    "b.sc",
    "bachelor",
    "ms",
    "m.tech",
    "m.sc",
    "mba",
]

BRANCH_KEYWORDS = [
    "computer",
    "electrical",
    "mechanical",
    "civil",
    "ece",
    "it",
    "information technology",
]


def extract_years(text: str) -> List[int]:
    out = []
    # find four-digit years in a safe way
    raw = re.findall(r"\b(?:19|20)\d{2}\b", text)
    for r in raw:
        try:
            out.append(int(r))
        except Exception:
            continue
    return sorted(set(out))


def extract_skills(text: str) -> List[str]:
    lower = text.lower()
    found = []
    for k in SKILL_KEYWORDS:
        if k in lower:
            found.append(k)
    return found


def extract_course(text: str) -> str:
    lower = text.lower()
    for k in COURSE_KEYWORDS:
        if k in lower:
            return k
    return ""


def extract_branch(text: str) -> str:
    lower = text.lower()
    for k in BRANCH_KEYWORDS:
        if k in lower:
            return k
    return ""


def parse_resume_text(text: str) -> Dict[str, Any]:
    years = extract_years(text)
    skills = extract_skills(text)
    course = extract_course(text)
    branch = extract_branch(text)
    estimated_grad = None
    if years:
        # assume the largest year is most likely graduation if it is recent
        estimated_grad = max(years)
    return {
        "graduationYear": estimated_grad,
        "skills": skills,
        "course": course,
        "branch": branch,
    }


def parse_and_update_student(
    alumni_id: str, text: str, updated_by: str
) -> Dict[str, Any]:
    parsed = parse_resume_text(text)
    changes = {}
    if parsed.get("graduationYear"):
        changes["graduationYear"] = parsed["graduationYear"]
    if parsed.get("skills"):
        # store as a list field
        changes["skills"] = parsed["skills"]
    if parsed.get("course"):
        changes["course"] = parsed["course"]
    if parsed.get("branch"):
        changes["branch"] = parsed["branch"]
    if not changes:
        return {"ok": False, "message": "No structured info found"}
    # Use db.patch_student to apply changes; it will increment version.
    updated = patch_student(alumni_id, changes, updated_by)
    if not updated:
        return {"ok": False, "message": "Student not found"}
    return {"ok": True, "student": updated, "parsed": parsed}
