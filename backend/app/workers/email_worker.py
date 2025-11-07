# app/workers/email_worker.py
import json
from google.cloud import pubsub_v1
from google.cloud import firestore
from app.services.email_service import send_email_direct
from app.config import PROJECT_ID, PUBSUB_EMAIL_TOPIC

subscriber = pubsub_v1.SubscriberClient()
db = firestore.client()


def callback(message):
    data = json.loads(message.data.decode("utf-8"))
    # job structure: {alumniId, collegeId, template, vars}
    alumniId = data.get("alumniId")
    # fetch student email
    doc = db.collection("scl_students").document(alumniId).get()
    if not doc.exists:
        message.ack()
        return
    student = doc.to_dict()
    to = student.get("email")
    template = data.get("template")
    vars = data.get("vars", {})
    subject = f"{vars.get('college', 'College')}: {template}"
    plain = f"Hi {vars.get('name', '')},\nPlease check your profile."
    try:
        status, headers = send_email_direct(to, subject, plain)
        # log
        db.collection("email_jobs").add({
            "alumniId": alumniId,
            "collegeId": data.get("collegeId"),
            "template": template,
            "status": "sent" if status in (200, 202) else "failed"
        })
        message.ack()
    except Exception:
        # for simplicity, nack to retry
        print("Send failed")
        message.nack()


def run_worker():
    topic_path = subscriber.subscription_path(
        PROJECT_ID, f"{PUBSUB_EMAIL_TOPIC}-sub"
    )
    streaming_pull_future = subscriber.subscribe(topic_path, callback=callback)
    print("Listening for email jobs on", topic_path)
    try:
        streaming_pull_future.result()
    except Exception:
        streaming_pull_future.cancel()
        raise


if __name__ == "__main__":
    run_worker()
