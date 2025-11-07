"""
WSGI/ASGI entrypoint for Render's default 'gunicorn app:app'.

This module re-exports the FastAPI app defined in backend/app/main.py so that
`gunicorn app:app` works without needing a custom start command.
"""

try:
    # When running from repository root (Render default)
    from backend.app.main import app as exported_app  # type: ignore
except ModuleNotFoundError:
    # Fallback if executed from within the backend/ directory locally
    from app.main import app as exported_app  # type: ignore

# Expose symbol exactly as gunicorn expects: `app`
app = exported_app
