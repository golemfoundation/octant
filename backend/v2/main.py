# Create FastAPI app
import logging
import os

import redis
import socketio
from app.exceptions import OctantException
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from v2.allocations.router import api as allocations_api
from v2.allocations.socket import AllocateNamespace
from v2.core.dependencies import get_socketio_settings
from v2.project_rewards.router import api as project_rewards_api

app = FastAPI()


@app.exception_handler(OctantException)
async def handle_octant_exception(request, ex: OctantException):
    return JSONResponse(
        status_code=ex.status_code,
        content={"message": ex.message},
    )


@app.exception_handler(SQLAlchemyError)
async def handle_sqlalchemy_exception(request, ex: SQLAlchemyError):
    logging.error(f"SQLAlchemyError: {ex}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )


def get_socketio_manager() -> socketio.AsyncRedisManager | None:
    if os.environ.get("SOCKETIO_MANAGER_TYPE") != "redis":
        logging.info("Initializing socketio manager to default in-memory manager")
        return None

    settings = get_socketio_settings()
    try:
        # Attempt to create a Redis connection
        redis_client = redis.Redis.from_url(settings.url)
        # Test the connection
        redis_client.ping()
        # If successful, return the AsyncRedisManager
        logging.info(
            f"Initialized socketio manager to redis://{settings.host}:{settings.port}/{settings.db}"
        )
        return socketio.AsyncRedisManager(settings.url)
    except Exception as e:
        logging.error(f"Failed to establish Redis connection: {str(e)}")
        raise


mgr = get_socketio_manager()
sio = socketio.AsyncServer(
    cors_allowed_origins="*", async_mode="asgi", client_manager=mgr
)
sio.register_namespace(AllocateNamespace("/"))
sio_asgi_app = socketio.ASGIApp(socketio_server=sio, other_asgi_app=app)

app.add_route("/socket.io/", route=sio_asgi_app)
app.add_websocket_route("/socket.io/", sio_asgi_app)

app.include_router(allocations_api)
app.include_router(project_rewards_api)
