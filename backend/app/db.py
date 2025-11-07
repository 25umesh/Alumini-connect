# app/db.py
from firebase_admin import firestore
from google.cloud import pubsub_v1
from .config import PROJECT_ID, PUBSUB_EMAIL_TOPIC
import logging

log = logging.getLogger(__name__)

# Lazily initialize Firestore and Pub/Sub clients. If Application Default
# Credentials are not available (common in local dev), don't crash on import;
# instead set the clients to None and raise a clear error when DB operations
# are attempted. This allows the FastAPI app to start without requiring a
# system-wide Python change.
try:
    db = firestore.client()
except Exception as e:
    log.warning("Firestore client not initialized: %s", e)
    db = None

# Don't create a PublisherClient at import time (it may attempt to
# contact metadata servers while resolving default credentials). Create
# it lazily in publish_student_updated when a publish is actually needed.
publisher = None


def create_student_doc(data: dict) -> dict:
    if db is None:
        raise RuntimeError(
            "Firestore not configured; set GOOGLE_APPLICATION_CREDENTIALS."
        )

    doc_ref = db.collection("scl_students").document()
    alumni_id = doc_ref.id
    base = {
        "alumniId": alumni_id,
        "linkedToCollege": False,
        "version": 1,
    }
    base.update(data)
    doc_ref.set(base)
    return {"alumniId": alumni_id, **base}


def create_college_doc(data: dict) -> dict:
    if db is None:
        raise RuntimeError(
            "Firestore not configured; set GOOGLE_APPLICATION_CREDENTIALS."
        )
    doc_ref = db.collection("colleges").document()
    college_id = doc_ref.id
    base = {"collegeId": college_id, "version": 1}
    base.update(data)
    doc_ref.set(base)
    return {"collegeId": college_id, **base}


def get_college(college_id: str) -> dict:
    if db is None:
        raise RuntimeError(
            "Firestore not configured; set GOOGLE_APPLICATION_CREDENTIALS."
        )
    doc = db.collection("colleges").document(college_id).get()
    return doc.to_dict() if doc.exists else None


def link_student_to_college(alumni_id: str, college_id: str, admin_uid: str) -> dict:
    """Link an SCL student doc to a college and mark it linked.

    Returns the updated document, or None if not found.
    """
    if db is None:
        raise RuntimeError(
            "Firestore not configured; set GOOGLE_APPLICATION_CREDENTIALS."
        )
    student_ref = db.collection("scl_students").document(alumni_id)
    doc = student_ref.get()
    if not doc.exists:
        return None
    changes = {
        "collegeId": college_id,
        "linkedToCollege": True,
        "lastLinkedAt": firestore.SERVER_TIMESTAMP,
        "lastLinkedBy": admin_uid,
    }
    # bump version
    data = doc.to_dict()
    changes["version"] = data.get("version", 1) + 1
    student_ref.update(changes)
    # audit
    db.collection("audit_logs").add({
        "alumniId": alumni_id,
        "actor": admin_uid,
        "action": "link_to_college",
        "collegeId": college_id,
    })
    publish_student_updated(alumni_id, changes)
    return student_ref.get().to_dict()


def get_student(alumni_id: str) -> dict:
    if db is None:
        raise RuntimeError(
            "Firestore not configured; set GOOGLE_APPLICATION_CREDENTIALS."
        )

    doc = db.collection("scl_students").document(alumni_id).get()
    return doc.to_dict() if doc.exists else None


def patch_student(alumni_id: str, changes: dict, updated_by: str) -> dict:
    if db is None:
        raise RuntimeError(
            "Firestore not configured; set GOOGLE_APPLICATION_CREDENTIALS."
        )

    doc_ref = db.collection("scl_students").document(alumni_id)
    doc = doc_ref.get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    new_version = data.get("version", 1) + 1
    changes["version"] = new_version
    changes["lastUpdatedAt"] = firestore.SERVER_TIMESTAMP
    changes["lastUpdatedBy"] = updated_by
    doc_ref.update(changes)
    # audit log
    db.collection("audit_logs").add({
        "alumniId": alumni_id,
        "actor": updated_by,
        "changes": changes
    })
    # publish pubsub event for webhooks
    publish_student_updated(alumni_id, changes)
    return doc_ref.get().to_dict()


def publish_student_updated(alumni_id: str, changes: dict):
    global publisher
    if publisher is None:
        try:
            publisher = pubsub_v1.PublisherClient()
        except Exception as e:
            log.info("Publisher not available; skipping publish: %s", e)
            return

    topic_path = publisher.topic_path(PROJECT_ID, PUBSUB_EMAIL_TOPIC)
    # Note: For production, create a specific webhook topic
    import json
    payload = json.dumps({
        "event": "student.updated",
        "alumniId": alumni_id,
        "changes": changes
    }).encode("utf-8")
    publisher.publish(topic_path, payload)
