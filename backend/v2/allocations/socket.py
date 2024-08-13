import json
import logging
from typing import List

from flask import current_app
import socketio
# from flask_socketio import emit

from app.engine.projects.rewards import ProjectRewardDTO
from app.exceptions import OctantException
# from app.extensions import socketio, epochs
from app.infrastructure.exception_handler import UNEXPECTED_EXCEPTION, ExceptionHandler

from app.modules.dto import ProjectDonationDTO
from app.modules.projects.rewards.controller import get_estimated_project_rewards
from app.modules.user.allocations import controller


from backend.v2.core.dependencies import get_w3
from backend.v2.epochs.contracts import Epochs
from backend.v2.epochs.dependencies import get_epochs
from backend.v2.projects.contracts import Projects

from backend.v2.projects.depdendencies import get_projects
from backend.v2.projects.services import get_projects_allocation_threshold


class AllocateNamespace(socketio.AsyncNamespace):

    def __init__(self, namespace: str):
        super().__init__(namespace=namespace)

        self.w3 = get_w3()
        self.settings = get_settings()
        self.epochs = get_epochs(self.w3, self.settings.epochs_contract_address)
        self.projects = get_projects(self.w3, self.settings.projects_contract_address)
    
    async def on_connect(self, sid: str, environ: dict):
        """
        Handle client connection
        """

        print("Type of sid", type(sid))
        print("Type of environ", type(environ))

        # socketio.logger.debug("Client connected")
        # app_instance = current_app._get_current_object()

        logging.debug("Client connected")

        print("Epochs are here")

        await self.emit("epoch", {"epoch": "fuckup"})

        # We send the data only in PENDING state
        pending_epoch_number = await self.epochs.get_pending_epoch()
    
        # We do not handle requests outside of pending epoch state
        if pending_epoch_number is None:
            return


        threshold = await get_projects_allocation_threshold(
            session=self.session,  # TODO:
            projects=self.projects,
            epoch_number=pending_epoch_number
        )

        await self.emit("threshold", {"threshold": str(threshold)})

        project_rewards = get_estimated_project_rewards().rewards
        await self.emit("project_rewards", _serialize_project_rewards(project_rewards))


    async def on_disconnect(self, sid):

        logging.debug("Client disconnected")


    async def on_allocate(self, sid: str, environ: dict) -> None:

    
        print("message", msg)
        msg = json.loads(msg)

        print("MEssage", msg)

        is_manually_edited = msg["isManuallyEdited"] if "isManuallyEdited" in msg else None
        user_address = msg["userAddress"]
        logging.info(f"User allocation payload: {msg}")
        controller.allocate(
            user_address,
            msg,
            is_manually_edited=is_manually_edited,
        )
        socketio.logger.info(f"User: {user_address} allocated successfully")

        threshold = get_projects_allocation_threshold()
        await self.emit("threshold", {"threshold": str(threshold)}, broadcast=True)

        project_rewards = get_estimated_project_rewards().rewards
        await self.emit(
            "project_rewards",
            _serialize_project_rewards(project_rewards),
            broadcast=True,
        )
        for project in project_rewards:
            donors = controller.get_all_donations_by_project(project.address)
            await self.emit(
                "project_donors",
                {"project": project.address, "donors": _serialize_donors(donors)},
                broadcast=True,
            )


# def state_context(epoch_state: EpochState) -> Context:
#     epoch_num = get_epoch_number(epoch_state)
#     return build_context(epoch_num, epoch_state, with_block_range)



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
