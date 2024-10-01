# Create FastAPI app
import logging
from fastapi.responses import JSONResponse
import socketio
from fastapi import FastAPI
from app.exceptions import OctantException
from v2.allocations.socket import AllocateNamespace
from sqlalchemy.exc import SQLAlchemyError

from v2.allocations.router import api as allocations_api

fastapi_app = FastAPI()


@fastapi_app.exception_handler(OctantException)
async def handle_octant_exception(request, ex: OctantException):
    return JSONResponse(
        status_code=ex.status_code,
        content={"message": ex.message},
    )

@fastapi_app.exception_handler(SQLAlchemyError)
async def handle_sqlalchemy_exception(request, ex: SQLAlchemyError):
    logging.error(f"SQLAlchemyError: {ex}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )


@fastapi_app.get("/fastapi-endpoint")
async def fastapi_endpoint():
    return {"message": "This is a FastAPI endpoint."}


sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
sio.register_namespace(AllocateNamespace("/"))
sio_asgi_app = socketio.ASGIApp(socketio_server=sio, other_asgi_app=fastapi_app)

fastapi_app.add_route("/socket.io/", route=sio_asgi_app)
fastapi_app.add_websocket_route("/socket.io/", sio_asgi_app)

fastapi_app.include_router(allocations_api)
# from v2.core.dependencies import create_tables
# fastapi_app.add_event_handler("startup", create_tables)
