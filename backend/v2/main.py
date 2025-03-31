import logging
import os

import redis
import socketio
from app.exceptions import OctantException
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from v2.allocations.router import api as allocations_api
from v2.projects.router import api as projects_api
from v2.allocations.socket import AllocateNamespace
from v2.core.dependencies import get_socketio_settings
from v2.project_rewards.router import api as project_rewards_api
from v2.epochs.router import api as epochs_api
from v2.users.router import api as users_api
from v2.delegations.router import api as delegations_api
from v2.deposits.router import api as deposits_api


async def handle_octant_exception(request: Request, ex: OctantException):
    return JSONResponse(
        status_code=ex.status_code,
        content={"message": ex.message},
    )


async def handle_sqlalchemy_exception(request: Request, ex: SQLAlchemyError):
    logging.error(f"SQLAlchemyError: {ex}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )


def build_app(debug: bool = False, include_socketio: bool = True) -> FastAPI:
    """Create and configure a FastAPI application.

    Args:
        debug (bool): We include additional logging if True
        include_socketio (bool): We include SocketIO if True

    Returns:
        FastAPI: Configured FastAPI application
    """
    app = FastAPI(debug=debug)

    # Register exception handlers
    app.add_exception_handler(OctantException, handle_octant_exception)
    app.add_exception_handler(SQLAlchemyError, handle_sqlalchemy_exception)

    # Setup SocketIO if not in testing mode
    if include_socketio:
        mgr = get_socketio_manager()
        sio = socketio.AsyncServer(
            cors_allowed_origins="*", async_mode="asgi", client_manager=mgr
        )
        sio.register_namespace(AllocateNamespace("/"))
        sio_asgi_app = socketio.ASGIApp(socketio_server=sio, other_asgi_app=app)

        app.add_route("/socket.io/", route=sio_asgi_app)
        app.add_websocket_route("/socket.io/", sio_asgi_app)

    # Register routers
    app.include_router(allocations_api)
    app.include_router(project_rewards_api)
    app.include_router(epochs_api)
    app.include_router(projects_api)
    app.include_router(users_api)
    app.include_router(delegations_api)
    app.include_router(deposits_api)

    return app


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

# Create the default app instance
app = build_app()
