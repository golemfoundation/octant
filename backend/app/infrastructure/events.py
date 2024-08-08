import json
from typing import List

from flask import current_app
# from flask_socketio import emit

from app.engine.projects.rewards import ProjectRewardDTO
from app.exceptions import OctantException
from app.extensions import socketio, epochs
from app.infrastructure.exception_handler import UNEXPECTED_EXCEPTION, ExceptionHandler
from app.modules.projects.rewards.controller import (
    get_allocation_threshold,
)
from app.modules.dto import ProjectDonationDTO
from app.modules.projects.rewards.controller import get_estimated_project_rewards
from app.modules.user.allocations import controller


@socketio.on("connect")
async def handle_connect(sid: str, environ: dict):

    print("Type of sid", type(sid))
    print("Type of environ", type(environ))

    # socketio.logger.debug("Client connected")
    # app_instance = current_app._get_current_object()
    with current_app.app_context():

        current_app.logger.debug("Cl/ient connected")

        print("Epochs are here")

        await socketio.emit("epoch", {"epoch": "fuckup"})

        if epochs.get_pending_epoch() is not None:
            threshold = get_allocation_threshold()
            await socketio.emit("threshold", {"threshold": str(threshold)})

            project_rewards = get_estimated_project_rewards().rewards
            await socketio.emit("project_rewards", _serialize_project_rewards(project_rewards))


@socketio.on("disconnect")
async def handle_disconnect(sid):
    socketio.logger.debug("Client disconnected")


@socketio.on("allocate")
async def handle_allocate(sid, msg):
  
    print("message", msg)
    msg = json.loads(msg)

    print("MEssage", msg)

    is_manually_edited = msg["isManuallyEdited"] if "isManuallyEdited" in msg else None
    user_address = msg["userAddress"]
    app.logger.info(f"User allocation payload: {msg}")
    controller.allocate(
        user_address,
        msg,
        is_manually_edited=is_manually_edited,
    )
    socketio.logger.info(f"User: {user_address} allocated successfully")

    threshold = get_allocation_threshold()
    emit("threshold", {"threshold": str(threshold)}, broadcast=True)

    project_rewards = get_estimated_project_rewards().rewards
    emit(
        "project_rewards",
        _serialize_project_rewards(project_rewards),
        broadcast=True,
    )
    for project in project_rewards:
        donors = controller.get_all_donations_by_project(project.address)
        emit(
            "project_donors",
            {"project": project.address, "donors": _serialize_donors(donors)},
            broadcast=True,
        )


# @socketio.on("project_donors")
# def handle_project_donors(project_address: str):
#     print("Project donors")
#     emit(
#         "project_donors",
#         {"project": project_address, "donors": []},
#     )
#     donors = controller.get_all_donations_by_project(project_address)
#     emit(
#         "project_donors",
#         {"project": project_address, "donors": _serialize_donors(donors)},
#     )


# @socketio.
def default_error_handler(e):
    ExceptionHandler.print_stacktrace(e)
    if isinstance(e, OctantException):
        emit("exception", {"message": str(e.message)})
    else:
        emit("exception", {"message": UNEXPECTED_EXCEPTION})


def _serialize_project_rewards(project_rewards: List[ProjectRewardDTO]) -> List[dict]:
    return [
        {
            "address": project_reward.address,
            "allocated": str(project_reward.allocated),
            "matched": str(project_reward.matched),
        }
        for project_reward in project_rewards
    ]


def _serialize_donors(donors: List[ProjectDonationDTO]) -> List[dict]:
    return [
        {
            "address": donor.donor,
            "amount": str(donor.amount),
        }
        for donor in donors
    ]
