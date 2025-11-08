# app/main.py
from fastapi import FastAPI
from fastapi.responses import Response
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

# Minimal logging config (Render sometimes drops DEBUG without handlers)
if os.getenv("APP_DEBUG", "0") == "1":  # pragma: no cover - runtime env
    logging.basicConfig(
        level=logging.DEBUG,
        format="[%(asctime)s] %(levelname)s %(name)s: %(message)s",
    )
else:  # ensure at least INFO level output for startup diagnostics
    logging.basicConfig(
        level=logging.INFO,
        format="[%(asctime)s] %(levelname)s %(name)s: %(message)s",
    )
log = logging.getLogger("app.startup")

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

try:
    app.include_router(students_router)
    app.include_router(admin_router)
    app.include_router(webhooks_router)
    app.include_router(bulk_email_router)
except Exception as e:  # pragma: no cover - import resilience
    # Surface router import errors early (e.g., dependency version issues)
    log.exception("Router registration failed: %s", e)
    # Leave app in degraded mode; fallback endpoints still work.


@app.get("/")
def root():
    return {"ok": True, "msg": "SCL API running"}


# Some platforms/bots send HEAD to "/"; FastAPI normally auto-adds HEAD for
# GET routes, but explicitly defining it avoids intermittent 405s from proxies.
@app.head("/")
def root_head():  # pragma: no cover - simple status path
    return Response(status_code=200)


@app.get("/healthz")
def healthz():
    """Lightweight health check that doesn't require external services.

    Returns degraded status if critical routers failed to import.
    """
    degraded = False
    # quick heuristic: students_router should have routes attribute
    try:
        _ = getattr(students_router, "routes", None)
        if not _:
            degraded = True
    except Exception:
        degraded = True
    return {"ok": True, "degraded": degraded}


@app.get("/favicon.ico", include_in_schema=False)
def favicon():  # pragma: no cover - browser convenience route
    # Return empty 204 to avoid noisy 404s in logs. Frontend serves the actual
    # favicon; backend API doesn't need to provide one.
    return Response(status_code=204)


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


@app.on_event("startup")
def _startup_banner():  # pragma: no cover - env dependent
    log.info("Starting Alumni SCL API")
    log.info("Python %s", os.sys.version.split()[0])
    log.info("FastAPI version: %s", FastAPI.__module__)
    log.info("Origins configured: %s", origins)
    debug = os.getenv("APP_DEBUG", "0") == "1"
    log.info("Debug mode: %s", debug)
    svc_account = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if svc_account:
        log.info("Firebase service account env set: %s", svc_account)
    else:
        log.warning("Firebase service account env NOT set")


# Debug exception logging middleware (enabled when APP_DEBUG=1)
if os.getenv("APP_DEBUG", "0") == "1":
    debug_log = logging.getLogger("app.debug")

    @app.middleware("http")
    async def error_logging_middleware(request, call_next):  # type: ignore
        try:
            return await call_next(request)
        except Exception as e:  # pragma: no cover
            debug_log.exception("Unhandled error: %s", e)
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=500,
                content={
                    "ok": False,
                    "error": str(e.__class__.__name__),
                    "detail": str(e),
                },
            )
