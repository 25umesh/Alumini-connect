#!/usr/bin/env bash
set -e

# Production startup (Render / Linux): run Gunicorn directly against the
# backend package app. The root app.py re-exports this as `app` for
# compatibility with `gunicorn app:app`, but using the explicit package path
# avoids any ambiguity.

if [ "${APP_DEBUG:-0}" = "1" ]; then
  echo "[start] Debug mode enabled: starting uvicorn directly"
  exec uvicorn entrypoint:app --host 0.0.0.0 --port ${PORT:-8000} --reload --log-level debug
else
  exec gunicorn \
    -w ${WEB_CONCURRENCY:-4} \
    -k uvicorn.workers.UvicornWorker \
    entrypoint:app \
    --bind 0.0.0.0:${PORT:-8000}
fi
