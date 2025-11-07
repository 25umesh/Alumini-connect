# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

FIREBASE_SERVICE_ACCOUNT = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT",
    "serviceAccount.json",
)
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
PROJECT_ID = os.getenv("PROJECT_ID", "")
PUBSUB_EMAIL_TOPIC = os.getenv("PUBSUB_EMAIL_TOPIC", "email-jobs")
PUBSUB_PARSE_TOPIC = os.getenv("PUBSUB_PARSE_TOPIC", "parse-jobs")
ONBOARD_TOKEN_SECRET = os.getenv("SECRET_ONBOARD_TOKEN", "change-me")
# Sender email used for outgoing mail (must be a verified sender
# in your SendGrid account)
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "alumni@college.edu")
# Global brand sender name used in emails
SENDER_NAME = os.getenv("SENDER_NAME", "Aluminiconnect")

# Optional SMTP configuration (e.g., Gmail App Password). If SMTP_HOST is set,
# the email service will use SMTP instead of SendGrid.
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
# Spaces are sometimes shown in app passwords (e.g., Gmail). Allow spaces in
# env and remove them at runtime for safety.
_SMTP_PASSWORD_RAW = os.getenv("SMTP_PASSWORD", "")
if _SMTP_PASSWORD_RAW:
    SMTP_PASSWORD = _SMTP_PASSWORD_RAW.replace(" ", "")
else:
    SMTP_PASSWORD = ""
