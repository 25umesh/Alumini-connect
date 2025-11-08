"""Unified FastAPI entrypoint for ``gunicorn app:app``.

This previously wrapped the ASGI app in a custom WSGI adapter so Gunicorn's
default sync worker could run the API. That caused failures once Uvicorn's
ASGI workers (or middleware expecting an ASGI callable) were used, producing
``TypeError: _AsgiToWsgi.__call__() missing 1 required positional argument:
 'start_response'``.

We now simply expose the underlying FastAPI ASGI application. Deployments
MUST use an ASGI worker (``-k uvicorn.workers.UvicornWorker``) or run Uvicorn
directly. This eliminates mixed-mode confusion and lifespan protocol issues.
"""

from __future__ import annotations
import os as _os
import sys as _sys

_repo_root = _os.path.dirname(_os.path.abspath(__file__))
if _repo_root not in _sys.path:
    _sys.path.insert(0, _repo_root)

# Turn this module into a namespace-like package early for submodule discovery.
_backend_app_dir = _os.path.join(_repo_root, "backend", "app")
try:
    __path__  # type: ignore[name-defined]
except NameError:
    __path__ = []  # type: ignore[assignment]
if _backend_app_dir not in __path__:  # type: ignore[operator]
    __path__.append(_backend_app_dir)  # type: ignore[union-attr]

# Import after path/package setup so absolute imports work.
from backend.app.main import app as fastapi_app  # type: ignore  # noqa: E402

# Diagnostic banner to confirm pure ASGI path.
try:  # pragma: no cover - runtime only
    import platform as _platform
    print(
        "[app.py] Exporting pure FastAPI ASGI app | "
        f"Python={_platform.python_version()}"
    )
    # Re-export as 'app' for gunicorn app:app.
    app = fastapi_app
except Exception:
    pass
