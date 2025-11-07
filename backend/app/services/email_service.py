# app/services/email_service.py
import json
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from google.cloud import pubsub_v1
from app.config import (
    SENDGRID_API_KEY,
    PROJECT_ID,
    PUBSUB_EMAIL_TOPIC,
    SENDER_EMAIL,
    SENDER_NAME,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_PASSWORD,
)
import logging

log = logging.getLogger(__name__)

# Create publisher lazily so importing the module doesn't attempt to
# resolve Google credentials (which can block or error in local dev).
publisher = None


def _get_sg_client():
    """Return configured SendGrid client or raise informative error."""
    if not SENDGRID_API_KEY:
        raise RuntimeError(
            "SENDGRID_API_KEY is not configured. Set it in backend/.env and "
            "restart the server."
        )
    return SendGridAPIClient(SENDGRID_API_KEY)


def _use_smtp() -> bool:
    """Return True if SMTP settings are present and should be used."""
    return bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD)


def _format_from_header() -> str:
    name = SENDER_NAME.strip() if SENDER_NAME else ""
    email = SENDER_EMAIL.strip()
    return f"{name} <{email}>" if name else email


def _send_via_smtp(
    to_emails: list,
    subject: str,
    plain_text: str,
    html_text: str | None = None,
):
    """Send email using SMTP with TLS.

    Uses BCC to send one message to multiple recipients without exposing
    recipient addresses to each other.
    """
    if not to_emails:
        raise RuntimeError("No recipients provided for SMTP send")

    msg = MIMEMultipart("alternative")
    msg["From"] = _format_from_header()
    msg["To"] = "undisclosed-recipients:;"
    msg["Subject"] = subject

    if plain_text:
        msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    if html_text:
        msg.attach(MIMEText(html_text, "html", "utf-8"))

    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        # Upgrade to TLS if supported (587)
        try:
            server.starttls(context=context)
            server.ehlo()
        except Exception:
            # If port is already TLS (e.g., 465 over SMTP_SSL), ignore
            pass
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_emails, msg.as_string())


def enqueue_email_job(job: dict):
    global publisher
    if publisher is None:
        try:
            publisher = pubsub_v1.PublisherClient()
        except Exception as e:
            log.info("Pub/Sub unavailable; skipping enqueue: %s", e)
            return

    topic_path = publisher.topic_path(PROJECT_ID, PUBSUB_EMAIL_TOPIC)
    data = json.dumps(job).encode("utf-8")
    publisher.publish(topic_path, data)


def send_email_direct(
    to_email: str,
    subject: str,
    plain_text: str,
    html_text: str = None,
):
    if _use_smtp():
        try:
            _send_via_smtp([to_email], subject, plain_text, html_text)
            return 250, {}
        except Exception as e:
            raise RuntimeError(f"SMTP send failed: {e}")
    else:
        sg = _get_sg_client()
        # Use configured sender email/name from app config
        from_addr = (
            (SENDER_EMAIL, SENDER_NAME) if SENDER_NAME else SENDER_EMAIL
        )
        message = Mail(
            from_email=from_addr,
            to_emails=to_email,
            subject=subject,
            plain_text_content=plain_text,
        )
        if html_text:
            message.html = html_text
        try:
            resp = sg.send(message)
        except Exception as e:
            status = getattr(e, "status_code", None)
            body = getattr(e, "body", None)
            detail = None
            if isinstance(body, (bytes, bytearray)):
                try:
                    detail = body.decode("utf-8", errors="ignore")
                except Exception:
                    detail = str(body)
            else:
                detail = str(body or e)

            if status in (401, 403):
                raise RuntimeError(
                    "Email provider unauthorized (" f"{status}). "
                    "Check SENDGRID_API_KEY and verify sender "
                    f"{SENDER_EMAIL}. Provider said: {detail}"
                )
            raise RuntimeError(
                f"Email provider error ({status}). Provider said: {detail}"
            )
        return resp.status_code, resp.headers


def send_bulk_emails(
    to_emails: list,
    subject: str = "",
    plain_text: str = "",
    html_text: str = None,
):
    """Send a single email to multiple recipients via SendGrid.

    to_emails: list of email addresses (strings)
    """
    if not to_emails:
        return {"ok": False, "message": "no recipients"}
    if _use_smtp():
        try:
            _send_via_smtp(to_emails, subject, plain_text, html_text)
            return {"status": 250}
        except Exception as e:
            raise RuntimeError(f"SMTP send failed: {e}")
    else:
        sg = _get_sg_client()
        from_addr = (
            (SENDER_EMAIL, SENDER_NAME) if SENDER_NAME else SENDER_EMAIL
        )
        message = Mail(
            from_email=from_addr,
            to_emails=to_emails,
            subject=subject,
            plain_text_content=plain_text,
        )
        if html_text:
            message.html = html_text
        try:
            resp = sg.send(message)
            return {"status": resp.status_code}
        except Exception as e:
            status = getattr(e, "status_code", None)
            body = getattr(e, "body", None)
            detail = None
            if isinstance(body, (bytes, bytearray)):
                try:
                    detail = body.decode("utf-8", errors="ignore")
                except Exception:
                    detail = str(body)
            else:
                detail = str(body or e)

            if status in (401, 403):
                raise RuntimeError(
                    "Email provider unauthorized (" f"{status}). "
                    "Check SENDGRID_API_KEY and verify sender "
                    f"{SENDER_EMAIL}. Provider said: {detail}"
                )
            raise RuntimeError(
                f"Email provider error ({status}). Provider said: {detail}"
            )
