import json

from flask import current_app
from flask_socketio import emit

from app.core.allocations import allocate
from app.exceptions import print_stacktrace, UNEXPECTED_EXCEPTION
from app.extensions import socketio


@socketio.on("connect")
def handle_connect():
    current_app.logger.info("Client connected")


@socketio.on("disconnect")
def handle_disconnect():
    current_app.logger.info("Client disconnected")


@socketio.on("allocate")
def handle_allocate(msg):
    msg = json.loads(msg)
    payload, signature = msg["payload"], msg["signature"]
    current_app.logger.info(
        f"User allocation: payload: {payload}, signature: {signature}"
    )
    allocate(payload, signature)


@socketio.on_error("allocate")
def handle_allocate_error(e):
    print_stacktrace()
    # TODO handle specific exceptions when validation is implemented
    emit("exception", json.dumps({"message": str(e.message)}))


@socketio.on_error_default
def default_error_handler(_):
    print_stacktrace()
    emit("exception", json.dumps({"message": UNEXPECTED_EXCEPTION}))
