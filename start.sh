#!/usr/bin/env bash
set -e

# Run gunicorn from the repo root but tell it to chdir into backend so the
# 'app' package (backend/app) is importable regardless of the invoking shell.
exec gunicorn \
	--chdir backend \
	-w 4 \
	-k uvicorn.workers.UvicornWorker \
	app.main:app \
	--bind 0.0.0.0:${PORT:-8000}
