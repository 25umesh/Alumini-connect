"""Entry point for Gunicorn / Uvicorn workers on Render.

Why this exists
---------------
The real FastAPI application lives in ``backend/app/main.py`` inside the
package ``backend.app``. A top-level ``app.py`` also exists as a legacy
Gunicorn entrypoint. Deploy platforms that attempt ``gunicorn app:app``
may accidentally import the root module instead of the package, causing
``ModuleNotFoundError: 'app.routes'``. This shim performs a resilient
import and exposes ``app`` for ASGI workers.

Improved fallback behavior
--------------------------
Previously if importing the real backend failed *and* FastAPI was not
installed, the process crashed and Render returned a generic HTML
"Internal Server Error" page making root‑cause discovery difficult.
We now provide a tiny raw ASGI fallback that returns plain text debug
information even if FastAPI itself is missing. If FastAPI is available
we still construct an informative JSON fallback application.
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
    """Return a fallback ASGI application that surfaces import errors.

    Preference order:
     1. If FastAPI is installed: return a minimal JSON API with
         endpoints /, /healthz, /_errors.
    2. Otherwise: return a raw ASGI app that responds with plain text so
       the platform never serves a blank 500 page.
    """
    try:
        from fastapi import FastAPI  # type: ignore
    except Exception:  # FastAPI not available – build raw ASGI app
        async def _raw(scope, receive, send):  # type: ignore[override]
            if scope.get("type") != "http":
                return
            path = scope.get("path", "")
            if path in ("/healthz", "/"):
                body = (
                    "Fallback active. Import error: "
                    f"{err.__class__.__name__}: {err}"
                ).encode()
                status = 200
            else:
                body = (
                    "Error details: "
                    f"{err.__class__.__name__}: {err}"
                ).encode()
                status = 503
            await send({
                "type": "http.response.start",
                "status": status,
                "headers": [(b"content-type", b"text/plain; charset=utf-8")],
            })
            await send({
                "type": "http.response.body",
                "body": body,
            })
        return _raw  # Raw ASGI app

    # FastAPI available – richer JSON fallback
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
        return {
            "ok": False,
            "message": "Backend import failed. See /_errors",
        }

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
except Exception as e:  # pragma: no cover - startup resilience
    # Provide robust fallback even if FastAPI missing.
    app = _make_fallback_app(e)
