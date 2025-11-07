# app/services/webhook.py
import hmac
import hashlib
import json
import requests

from firebase_admin import firestore


def sign_payload(secret: str, payload: dict) -> str:
    s = json.dumps(payload, separators=(',', ':'), sort_keys=True)
    return hmac.new(
        secret.encode(), s.encode(), hashlib.sha256
    ).hexdigest()


def dispatch_to_college(college_id: str, payload: dict):
    """Look up webhook registrations and dispatch signed payloads."""
    db = firestore.client()
    reg_doc = db.collection("webhook_registrations").document(college_id).get()
    if not reg_doc.exists:
        return False
    reg = reg_doc.to_dict()
    url = reg.get("url")
    secret = reg.get("hmacSecret")
    signature = sign_payload(secret, payload)
    headers = {
        "Content-Type": "application/json",
        "X-SCL-Signature": signature,
    }
    try:
        r = requests.post(url, json=payload, headers=headers, timeout=6)
        return r.status_code, r.text
    except Exception as e:
        return None, str(e)
