# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

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
