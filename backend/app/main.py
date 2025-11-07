# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes.students import router as students_router
from app.routes.admin import router as admin_router
from app.routes.webhooks import router as webhooks_router
from app.routes.bulk_email import router as bulk_email_router


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
