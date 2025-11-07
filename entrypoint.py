"""Entry point for Gunicorn / Uvicorn workers on Render.

Avoid naming this module `app.py` to prevent clashing with the real
`app` package (backend/app). This module exposes a variable named `app`
that Gunicorn can discover via `entrypoint:app`.
"""

from __future__ import annotations

import os
import sys
from importlib import import_module


def _import_fastapi_app():
    """Return the FastAPI app instance from backend/app/main.py.

    Tries several strategies to be resilient to different PYTHONPATH layouts:
    1. If PYTHONPATH points at the backend directory: import app.main
    2. If repo root is on sys.path: import backend.app.main
    3. Fallback: add repo_root/backend to sys.path then import app.main
    """

    # 1: PYTHONPATH=/path/to/repo/backend  -> package 'app'
    try:
        return import_module("app.main").app  # type: ignore[attr-defined]
    except ModuleNotFoundError:
        pass

    # 2: Repo root on sys.path and backend is a package -> backend.app.main
    try:
        return import_module("backend.app.main").app  # type: ignore
    except ModuleNotFoundError:
        pass

    # 3: Manually append backend directory then retry app.main
    repo_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(repo_root, "backend")
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    return import_module("app.main").app  # type: ignore[attr-defined]


# Expose the ASGI application for Gunicorn/Uvicorn workers
app = _import_fastapi_app()
