# Create FastAPI app
import socketio
from fastapi import FastAPI
from v2.allocations.socket import AllocateNamespace
from v2.core.dependencies import create_tables

fastapi_app = FastAPI()


@fastapi_app.get("/fastapi-endpoint")
async def fastapi_endpoint():
    return {"message": "This is a FastAPI endpoint."}


sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
sio.register_namespace(AllocateNamespace("/"))
sio_asgi_app = socketio.ASGIApp(socketio_server=sio, other_asgi_app=fastapi_app)

# app.mount("/static", StaticFiles(directory="static"), name="static")
# fastapi_app.mount("/", sio_asgi_app)
fastapi_app.add_route("/socket.io/", route=sio_asgi_app)
fastapi_app.add_websocket_route("/socket.io/", sio_asgi_app)


fastapi_app.add_event_handler("startup", create_tables)
