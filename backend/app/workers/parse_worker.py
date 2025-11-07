# app/workers/parse_worker.py
# Simple parse worker: download file from GCS and extract email/phone via regex
from google.cloud import pubsub_v1
from google.cloud import storage
from google.cloud import firestore

import json
import re
from app.config import PROJECT_ID, PUBSUB_PARSE_TOPIC

subscriber = pubsub_v1.SubscriberClient()
storage_client = storage.Client()
db = firestore.client()

EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_RE = re.compile(r"(\+?\d{10,15})")


def callback(message):
    data = json.loads(message.data.decode("utf-8"))
    resume_path = data.get("path")  # expects 'resumes/{alumniId}/{filename}'
    alumniId = data.get("alumniId")
    try:
        bucket_name, *rest = resume_path.replace("gs://", "").split("/", 1)
        file_path = rest[0]
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_path)
        content = blob.download_as_text(errors="ignore")
        emails = EMAIL_RE.findall(content)
        phones = PHONE_RE.findall(content)
        parsed = {"emails": emails, "phones": phones}
        # save
        db.collection("resumes").add({
            "alumniId": alumniId,
            "storagePath": resume_path,
            "parsedJson": parsed,
            "confidence": 0.7,
            "accepted": False
        })
        message.ack()
    except Exception as e:
        print("Parse failed", e)
        message.nack()


def run_worker():
    topic_path = subscriber.subscription_path(
        PROJECT_ID, f"{PUBSUB_PARSE_TOPIC}-sub"
    )
    streaming_pull_future = subscriber.subscribe(topic_path, callback=callback)
    print("Listening for parse jobs on", topic_path)
    try:
        streaming_pull_future.result()
    except Exception:
        streaming_pull_future.cancel()
        raise


if __name__ == "__main__":
    run_worker()
