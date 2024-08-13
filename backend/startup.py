import asyncio
from concurrent.futures import ThreadPoolExecutor
import io
import os
from fastapi import FastAPI, Request
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, StreamingResponse
from starlette.responses import Response

from starlette.middleware.base import BaseHTTPMiddleware


if os.getenv("SENTRY_DSN"):
    import sentry_sdk

    print("[+] Starting sentry")

    sentry_sdk.init(
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
        enable_tracing=True,
    )

from app import create_app  # noqa
from app.extensions import db  # noqa

# Create Flask app
flask_app = create_app()

@flask_app.teardown_request
def teardown_session(*args, **kwargs):
    db.session.remove()


from v2.main import fastapi_app

# Create FastAPI app
# fastapi_app = FastAPI()

# @fastapi_app.get("/fastapi-endpoint")
# async def fastapi_endpoint():
#     return {"message": "This is a FastAPI endpoint."}

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
        if path.startswith('/flask'):
            return await call_next(request)
        request.scope['path'] = '/flask' + path  # Adjust the path as needed
        response = await call_next(request)
        return response
    

fastapi_app.add_middleware(PathCheckMiddleware)


# from app.extensions import socketio as our_socketio
# import socketio

# sio_asgi_app = socketio.ASGIApp(socketio_server=our_socketio, other_asgi_app=fastapi_app)

# # app.mount("/static", StaticFiles(directory="static"), name="static")
# fastapi_app.add_route("/socket.io/", route=sio_asgi_app)
# fastapi_app.add_websocket_route("/socket.io/", sio_asgi_app)
