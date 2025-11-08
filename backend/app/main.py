# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

"""FastAPI application factory and router registration.

Note on imports: This package lives under ``backend.app``. A top-level
``app.py`` module also exists at the repository root as a Gunicorn entrypoint
(``gunicorn app:app``). Absolute imports like ``from app.routes`` cause Python
to resolve the root ``app.py`` instead of this package, producing
``ModuleNotFoundError: No module named 'app.routes'`` during deployment.

Using explicit relative imports (``from .routes``) ensures the backend package
resolves correctly regardless of how the application is launched.
"""

from .routes.students import router as students_router
from .routes.admin import router as admin_router
from .routes.webhooks import router as webhooks_router
from .routes.bulk_email import router as bulk_email_router


app = FastAPI(title="Alumni SCL API")

# Allow requests from the frontend dev server. Set FRONTEND_ORIGINS as a
# comma-separated env var if you run the frontend on a different origin.
default_origins = (
    "http://localhost:3000,http://127.0.0.1:3000,"
    "http://localhost:5173,http://127.0.0.1:5173"
)
origins = os.environ.get("FRONTEND_ORIGINS", default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students_router)
app.include_router(admin_router)
app.include_router(webhooks_router)
app.include_router(bulk_email_router)


@app.get("/")
def root():
    return {"ok": True, "msg": "SCL API running"}


@app.get("/healthz")
def healthz():
    """Lightweight health check that doesn't require external services.

    Useful for platform health probes without touching Firestore or Firebase.
    """
    return {"ok": True}


@app.get("/_info")
def app_info():
    """Return minimal environment/debug info (non-sensitive)."""
    import sys
    import platform
    import os as _os
    return {
        "ok": True,
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "fastapi": getattr(FastAPI, "__module__", "fastapi"),
        "cwd": _os.getcwd(),
    }


# Debug exception logging middleware (enabled when APP_DEBUG=1)
if os.getenv("APP_DEBUG", "0") == "1":
    log = logging.getLogger("app.debug")

    @app.middleware("http")
    async def error_logging_middleware(request, call_next):  # type: ignore
        try:
            return await call_next(request)
        except Exception as e:  # pragma: no cover
            log.exception("Unhandled error: %s", e)
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=500,
                content={
                    "ok": False,
                    "error": str(e.__class__.__name__),
                    "detail": str(e),
                },
            )
