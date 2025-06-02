from contextlib import asynccontextmanager
import logging
import os

import redis
import socketio
from app.exceptions import OctantException
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from v2.withdrawals.dependencies import get_vault_settings
from v2.allocations.router import api as allocations_api
from v2.projects.router import api as projects_api
from v2.allocations.socket import AllocateNamespace
from v2.core.dependencies import get_environment_settings, get_socketio_settings
from v2.project_rewards.router import api as project_rewards_api
from v2.epochs.router import api as epochs_api
from v2.users.router import api as users_api
from v2.delegations.router import api as delegations_api
from v2.deposits.router import api as deposits_api
from v2.multisig.router import api as multisig_signatures_api
from v2.withdrawals.router import api as withdrawals_api
from v2.withdrawals.scheduler import confirm_withdrawals_scheduled
from v2.info.router import api as info_api
from v2.snapshots.router import api as snapshots_api
from v2.history.router import api as history_api
from v2.glms.router import api as glms_api

logging.basicConfig(level=logging.INFO)


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


def build_app(debug: bool = False) -> FastAPI:
    """Create and configure a FastAPI application.

    Args:
        debug (bool): We include additional logging if True

    Returns:
        FastAPI: Configured FastAPI application
    """

    app = FastAPI(
        debug=debug,
        lifespan=lifespan,
        docs_url="/",
    )

    # Setup the scheduler
    setup_scheduler(app)

    # Register exception handlers
    app.add_exception_handler(OctantException, handle_octant_exception)
    app.add_exception_handler(SQLAlchemyError, handle_sqlalchemy_exception)

    # Setup SocketIO
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
    app.include_router(multisig_signatures_api)
    app.include_router(withdrawals_api)
    app.include_router(info_api)
    app.include_router(snapshots_api)
    app.include_router(history_api)
    app.include_router(glms_api)

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


def setup_scheduler(app: FastAPI) -> AsyncIOScheduler | None:
    """
    Setup the scheduler for the application.
    Returns None if the scheduler is not enabled / used.
    """

    # Make sure the scheduler is globally enabled
    env_settings = get_environment_settings()
    if not env_settings.scheduler_enabled:
        logging.info("Scheduler is disabled globally")
        return None

    # If there's nothing to be added we can just not start it.
    vault_settings = get_vault_settings()
    if not vault_settings.vault_confirm_withdrawals_enabled:
        logging.info("Scheduler is disabled because no jobs are configured")
        return None

    logging.info("Scheduler is enabled, adding jobs...")

    logging.getLogger("apscheduler").setLevel(logging.WARNING)

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        confirm_withdrawals_scheduled,
        "interval",
        id="vault-confirm-withdrawals",
        seconds=15,
        misfire_grace_time=900,
        max_instances=1,
    )

    # Assign the scheduler to the app state
    app.state.scheduler = scheduler

    return scheduler


# Ensure the scheduler (if used) starts and shuts down properly on application exit.
@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = getattr(app.state, "scheduler", None)
    if scheduler:
        logging.info("Starting the scheduler...")
        scheduler.start()

    yield

    if scheduler:
        logging.info("Shutting down the scheduler...")
        scheduler.shutdown()
