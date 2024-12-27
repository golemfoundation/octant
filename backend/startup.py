import os
from fastapi import Request
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.routing import Match

from starlette.middleware.base import BaseHTTPMiddleware

from app import create_app as create_flask_app
from app.extensions import db as flask_db

if os.getenv("SENTRY_DSN"):
    import sentry_sdk

    def sentry_before_send(event, hint):
        exceptions = event.get("exception", [])
        if not exceptions:
            return event

        exc = exceptions[-1]
        mechanism = exc.get("mechanism", {})

        if mechanism.get("handled"):
            return None

        return event
        exceptions = event["exception"]
        if exceptions:
            exc = exceptions[-1]
            mechanism = exc.get("mechanism")
            if mechanism:
                if mechanism.get("handled"):
                    return None

        return event

    print("[+] Starting sentry")

    sentry_sdk.init(
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
        enable_tracing=True,
        before_send=sentry_before_send,
    )


flask_app = create_flask_app()


@flask_app.teardown_request
def teardown_session(*args, **kwargs):
    flask_db.session.remove()


# I'm importing it here to make sure that the flask initializes before the fastapi one
from v2.main import app as fastapi_app  # noqa


# Middleware to check if the path exists in FastAPI
# If it does, proceed with the request
# If it doesn't, modify the request to forward to the Flask app
class PathCheckMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        for route in fastapi_app.routes:
            match, _ = route.matches(
                {"type": "http", "path": path, "method": request.method}
            )
            if match != Match.NONE:
                return await call_next(request)

        # If path does not exist, modify the request to forward to the Flask app
        if path.startswith("/flask"):
            return await call_next(request)
        request.scope["path"] = "/flask" + path  # Adjust the path as needed
        response = await call_next(request)
        return response


# Setup the pass-through to Flask app
fastapi_app.add_middleware(PathCheckMiddleware)
fastapi_app.mount("/flask", WSGIMiddleware(flask_app))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(fastapi_app, host="0.0.0.0", port=5000)
