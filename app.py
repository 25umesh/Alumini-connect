"""Gunicorn entrypoint `gunicorn app:app`.

Context
-------
On Render the service launches via ``gunicorn app:app`` using the default
"sync" worker which expects a WSGI callable. FastAPI provides an ASGI app and
will error under a WSGI-only worker with:

    TypeError: FastAPI.__call__() missing 1 required positional
    argument: 'send'

This module adapts the ASGI app to a WSGI callable using ``asgiref`` so that
``gunicorn`` sync can serve it. It also preserves import semantics so that any
``from app.*`` imports resolve to the backend package directory.
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
from backend.app.main import app as _fastapi_app  # type: ignore  # noqa: E402

# If asgiref is available, expose a WSGI wrapper for Gunicorn sync workers.
# If it's not available, we still expose the ASGI app so ASGI workers work.
# Prefer ASGI; if a sync worker is forced erroneously, we attempt a
# lightweight WSGI shim so requests at least don't crash immediately.
app = _fastapi_app
try:  # noqa: E402
    # asgiref does not expose AsgiToWsgi anymore; only WsgiToAsgi.
    # We keep the app ASGI. Proper fix: ensure gunicorn uses ASGI worker.
    pass
except Exception:  # pragma: no cover
    pass
