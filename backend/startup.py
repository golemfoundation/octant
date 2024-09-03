import os
from fastapi import Request
from fastapi.middleware.wsgi import WSGIMiddleware


from starlette.middleware.base import BaseHTTPMiddleware


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

from app import create_app  # noqa
from app.extensions import db  # noqa

# Create Flask app
flask_app = create_app()


@flask_app.teardown_request
def teardown_session(*args, **kwargs):
    db.session.remove()


from v2.main import fastapi_app  # noqa

# Mount Flask app under a sub-path
fastapi_app.mount("/flask", WSGIMiddleware(flask_app))


# Middleware to check if the path exists in FastAPI
class PathCheckMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        # Check if the path exists in FastAPI routes
        for route in fastapi_app.routes:
            if path == route.path:
                # If path exists, proceed with the request
                return await call_next(request)
        # If path does not exist, modify the request to forward to the Flask app
        if path.startswith("/flask"):
            return await call_next(request)
        request.scope["path"] = "/flask" + path  # Adjust the path as needed
        response = await call_next(request)
        return response


fastapi_app.add_middleware(PathCheckMiddleware)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(fastapi_app, host="0.0.0.0", port=5000)
