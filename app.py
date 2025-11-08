"""
WSGI/ASGI entrypoint for Render's default 'gunicorn app:app'.

This module re-exports the FastAPI app defined in backend/app/main.py so that
`gunicorn app:app` works without needing a custom start command.

Additionally, to be resilient against any legacy absolute imports like
`from app.routes import ...` inside backend code, we mark this module as a
package by setting `__path__` to the backend/app directory. That way, if any
code tries to import `app.<submodule>`, Python can resolve it under
`backend/app/` instead of treating this file as a plain module only.
"""

import os as _os
import sys as _sys
from backend.app.main import app as exported_app  # type: ignore

_repo_root = _os.path.dirname(_os.path.abspath(__file__))
if _repo_root not in _sys.path:
    _sys.path.insert(0, _repo_root)

# Treat this module as a package for submodule resolution (e.g., app.routes)
_backend_app_dir = _os.path.join(_repo_root, "backend", "app")
try:
    __path__  # type: ignore[name-defined]
except NameError:
    __path__ = []  # type: ignore[assignment]
if _backend_app_dir not in __path__:  # type: ignore[operator]
    __path__.append(_backend_app_dir)  # type: ignore[union-attr]

# Expose symbol exactly as gunicorn expects: `app`
app = exported_app
