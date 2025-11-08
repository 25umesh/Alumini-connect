"""Gunicorn entrypoint `gunicorn app:app`.

We need to ensure any legacy absolute imports like ``from app.routes`` resolve
into the package directory ``backend/app`` *before* importing
``backend.app.main``. Previously the import happened first and Python locked
``app`` as a simple module object, so subsequent attempts to resolve
``app.routes`` failed with ``ModuleNotFoundError: 'app' is not a package``.

Fix: perform sys.path injection and set ``__path__`` prior to importing the
actual FastAPI application, then re-export it as ``app``.
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

# Re-export for Gunicorn.
app = _fastapi_app
