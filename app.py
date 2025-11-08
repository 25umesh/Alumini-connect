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

# Provide a tiny ASGI->WSGI adapter so `gunicorn app:app` with the default
# sync worker can serve the API. Adapter supports standard request & response
# bodies (no streaming / websockets) which is sufficient for our JSON API.
import asyncio as _asyncio  # noqa: E402


class _AsgiToWsgi:  # internal adapter
    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    def __call__(self, environ, start_response):
        # Build minimal ASGI HTTP scope from WSGI environ
        method = environ.get("REQUEST_METHOD", "GET")
        path = environ.get("PATH_INFO", "") or "/"
        query_string = environ.get("QUERY_STRING", "").encode("latin-1")
        scheme = environ.get("wsgi.url_scheme", "http")
        server_port_raw = environ.get("SERVER_PORT", "0") or "0"
        server = (environ.get("SERVER_NAME"), int(server_port_raw))
        client = (environ.get("REMOTE_ADDR"), 0)

        headers = []
        for k, v in environ.items():
            if k.startswith("HTTP_"):
                name = k[5:].replace("_", "-").lower().encode("latin-1")
                headers.append((name, str(v).encode("latin-1")))
        if "CONTENT_TYPE" in environ:
            ctype = environ["CONTENT_TYPE"].encode("latin-1")
            headers.append((b"content-type", ctype))
        if "CONTENT_LENGTH" in environ:
            clen = str(environ["CONTENT_LENGTH"]).encode("latin-1")
            headers.append((b"content-length", clen))

        scope = {
            "type": "http",
            "http_version": "1.1",
            "method": method,
            "scheme": scheme,
            "path": path,
            "raw_path": path.encode("utf-8"),
            "query_string": query_string,
            "headers": headers,
            "server": server,
            "client": client,
        }

        # Prepare request body from WSGI input
        wsgi_input = environ.get("wsgi.input")
        try:
            raw_len = environ.get("CONTENT_LENGTH")
            length = int(raw_len) if raw_len else 0
        except Exception:
            length = 0
        body = b""
        if wsgi_input and length:
            body = wsgi_input.read(length)

        response_status = {"code": 200}
        response_headers = []
        response_body_chunks = []

        async def receive():
            nonlocal body
            b = body
            body = b""
            return {"type": "http.request", "body": b, "more_body": False}

        async def send(message):
            mtype = message.get("type")
            if mtype == "http.response.start":
                status = message.get("status", 200)
                response_status["code"] = status
                hdrs = message.get("headers", [])
                for k, v in hdrs:
                    k_dec = k.decode("latin-1")
                    v_dec = v.decode("latin-1")
                    response_headers.append((k_dec, v_dec))
            elif mtype == "http.response.body":
                chunk = message.get("body", b"")
                if chunk:
                    response_body_chunks.append(chunk)

        async def _run():
            await self.asgi_app(scope, receive, send)

        _asyncio.run(_run())

        status_code = response_status.get("code", 200)
        if status_code == 200:
            status_line = "200 OK"
        elif status_code == 204:
            status_line = "204 No Content"
        elif status_code == 404:
            status_line = "404 Not Found"
        elif status_code >= 500:
            status_line = "500 Internal Server Error"
        else:
            status_line = f"{status_code} UNKNOWN"

        start_response(status_line, response_headers)
        return [b"".join(response_body_chunks)]


# Expose a WSGI callable for gunicorn sync workers
app = _AsgiToWsgi(_fastapi_app)

# Emit a small banner to make it obvious in logs when the WSGI adapter is
# active (i.e., when Gunicorn is using the default sync worker instead of an
# ASGI worker). This helps diagnose deployments that are not using start.sh.
try:  # pragma: no cover - runtime only
    import platform as _platform
    print(
        "[app.py] WSGI adapter wrapping FastAPI app | "
        f"Python={_platform.python_version()}"
    )
except Exception:
    pass
