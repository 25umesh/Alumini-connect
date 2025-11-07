"""
WSGI/ASGI entrypoint for Render's default 'gunicorn app:app'.

This module re-exports the FastAPI app defined in backend/app/main.py so that
`gunicorn app:app` works without needing a custom start command.
"""

try:
    # Preferred: import via package path from repo root
    from backend.app.main import app as exported_app  # type: ignore
except ModuleNotFoundError:
    # Ensure repo root is on sys.path, then import backend.app.main again
    import os as _os
    import sys as _sys

    _repo_root = _os.path.dirname(_os.path.abspath(__file__))
    if _repo_root not in _sys.path:
        _sys.path.insert(0, _repo_root)

    from backend.app.main import app as exported_app  # type: ignore

# Expose symbol exactly as gunicorn expects: `app`
app = exported_app
