# Gunicorn configuration file to ensure ASGI worker is used on Render
# even when the platform starts with `gunicorn app:app`.

import os

# Use Uvicorn's ASGI worker to serve FastAPI correctly
worker_class = "uvicorn.workers.UvicornWorker"

# Number of worker processes
workers = int(os.getenv("WEB_CONCURRENCY", "2"))

# Bind to the port Render provides
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# Forward logs to stdout/stderr so Render captures them
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info")

# Increase timeouts for cold starts or slow external calls
timeout = int(os.getenv("GUNICORN_TIMEOUT", "90"))
