"""Entry point for Gunicorn / Uvicorn workers on Render.

Avoid naming this module `app.py` to prevent clashing with the real
`app` package (backend/app). This module exposes a variable named `app`
that Gunicorn can discover via `entrypoint:app`.
"""

from __future__ import annotations

import os
import sys
from importlib import import_module
from typing import Any

# Optional: build a tiny fallback FastAPI app when imports fail so Render
# serves JSON instead of a blank 500 page. This is enabled automatically
# when we can't import the real app.


def _make_fallback_app(err: Exception):
    try:
        from fastapi import FastAPI
    except Exception:
        # If FastAPI itself isn't importable, raise original error
        raise err
    app = FastAPI(title="Fallback - Backend Import Error")

    @app.get("/healthz")
    def healthz():
        return {"ok": True, "status": "degraded"}

    @app.get("/_errors")
    def errors():
        return {
            "ok": False,
            "error": err.__class__.__name__,
            "detail": str(err),
        }

    @app.get("/")
    def root():
        return {"ok": False, "message": "Backend import failed. See /_errors"}

    return app


def _import_fastapi_app() -> Any:
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
try:
    app = _import_fastapi_app()
except Exception as e:
    # Fall back to a minimal app so the service serves responses and
    # exposes the import error at /_errors instead of crashing.
    app = _make_fallback_app(e)
