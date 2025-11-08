#!/usr/bin/env bash
set -e

# Production startup (Render / Linux): run Gunicorn directly against the
# backend package app. The root app.py re-exports this as `app` for
# compatibility with `gunicorn app:app`, but using the explicit package path
# avoids any ambiguity.

exec gunicorn \
  -w ${WEB_CONCURRENCY:-4} \
  -k uvicorn.workers.UvicornWorker \
  backend.app.main:app \
  --bind 0.0.0.0:${PORT:-8000}
