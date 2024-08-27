import logging
from typing import List

import socketio
from app.engine.projects.rewards import ProjectRewardDTO
from app.exceptions import OctantException

# from app.extensions import socketio, epochs
from app.infrastructure.exception_handler import UNEXPECTED_EXCEPTION, ExceptionHandler
from app.modules.dto import ProjectDonationDTO
from eth_utils import to_checksum_address
from v2.allocations.repositories import get_donations_by_project
from v2.allocations.services import allocate
from v2.core.dependencies import db_getter, get_w3, w3_getter
from v2.epochs.dependencies import epochs_getter, epochs_subgraph_getter, get_epochs
from v2.projects.depdendencies import get_projects, projects_getter
from v2.projects.services import (
    get_estimated_project_rewards,
    get_projects_allocation_threshold,
)

from .models import AllocationRequest, UserAllocationRequest


class AllocateNamespace(socketio.AsyncNamespace):
    def __init__(self, namespace: str):
        super().__init__(namespace=namespace)

        # self.w3 = w3_getter()
        self.epochs_contracts = epochs_getter()
        self.epochs_subgraph = epochs_subgraph_getter()
        self.projects_contracts = projects_getter()
        self.db_session = db_getter()

    async def on_connect(self, sid: str, environ: dict):
        """
        Handle client connection
        """

        print("Type of sid", type(sid))
        print("Type of environ", type(environ))

        logging.debug("Client connected")

        print("Epochs are here")

        await self.emit("epoch", {"epoch": "fuckup"})

        # We send the data only in PENDING state
        pending_epoch_number = await self.epochs_contracts.get_pending_epoch()

        epoch_end = await self.epochs_contracts.get_current_epoch_end()

        print("epocg_end", epoch_end)
        print("Pending epoch =", pending_epoch_number)

        # We do not handle requests outside of pending epoch state
        # if pending_epoch_number is None:
        #     return

        pending_epoch_number = 124

        async with self.db_session() as session:
            threshold = await get_projects_allocation_threshold(
                session=session,
                projects=self.projects_contracts,
                epoch_number=pending_epoch_number,
            )

            await self.emit("threshold", {"threshold": str(threshold)})

            project_rewards = await get_estimated_project_rewards(
                session=session,
                projects=self.projects_contracts,
                epochs_subgraph=self.epochs_subgraph,
                epoch_number=pending_epoch_number,
            )

        rewards = [
            {
                "address": project_address,
                "allocated": str(project_rewards.amounts_by_project[project_address]),
                "matched": str(project_rewards.matched_by_project[project_address]),
            }
            for project_address in project_rewards.amounts_by_project.keys()
        ]

        # project_rewards = get_estimated_project_rewards().rewards
        await self.emit("project_rewards", rewards)

    async def on_disconnect(self, sid):
        logging.debug("Client disconnected")

    async def on_allocate(self, sid: str, data: dict):
        """
        Handle allocation request
        """

        # # We do not handle requests outside of pending epoch state (Allocation Window)
        # pending_epoch_number = await self.epochs_contracts.get_pending_epoch()
        # if pending_epoch_number is None:
        #     return

        print("message", data, type(data))

        request = from_dict(data)
        pending_epoch_number = 124

        async with self.db_session() as session:
            await allocate(
                session=session,
                projects_contracts=self.projects_contracts,
                epochs_subgraph=self.epochs_subgraph,
                epoch_number=pending_epoch_number,
                request=request,
            )

            threshold = await get_projects_allocation_threshold(
                session=session,
                projects=self.projects_contracts,
                epoch_number=pending_epoch_number,
            )

            await self.emit("threshold", {"threshold": str(threshold)})
            project_rewards = await get_estimated_project_rewards(
                session=session,
                projects=self.projects_contracts,
                epochs_subgraph=self.epochs_subgraph,
                epoch_number=pending_epoch_number,
            )

            rewards = [
                {
                    "address": project_address,
                    "allocated": str(
                        project_rewards.amounts_by_project[project_address]
                    ),
                    "matched": str(project_rewards.matched_by_project[project_address]),
                }
                for project_address in project_rewards.amounts_by_project.keys()
            ]

            await self.emit("project_rewards", rewards)

            for project_address in project_rewards.amounts_by_project.keys():
                donations = await get_donations_by_project(
                    session=session,
                    project_address=project_address,
                    epoch_number=pending_epoch_number,
                )

                await self.emit(
                    "project_donors",
                    {"project": project_address, "donors": donations},
                )

        # msg = json.loads(msg)

        # print("MEssage", msg)

        # is_manually_edited = data.get("isManuallyEdited", None)
        # user_address = data["userAddress"]
        # # is_manually_edited = (
        # #     msg["isManuallyEdited"] if "isManuallyEdited" in msg else None
        # # )
        # logging.info(f"User allocation payload: {msg}")

        # controller.allocate(
        #     user_address,
        #     msg,
        #     is_manually_edited=is_manually_edited,
        # )
        # socketio.logger.info(f"User: {user_address} allocated successfully")

        # threshold = get_projects_allocation_threshold()
        # await self.emit("threshold", {"threshold": str(threshold)}, broadcast=True)

        # project_rewards = get_estimated_project_rewards().rewards
        # await self.emit(
        #     "project_rewards",
        #     _serialize_project_rewards(project_rewards),
        #     broadcast=True,
        # )
        # for project in project_rewards:
        #     donors = controller.get_all_donations_by_project(project.address)
        #     await self.emit(
        #         "project_donors",
        #         {"project": project.address, "donors": _serialize_donors(donors)},
        #         broadcast=True,
        #     )


def from_dict(data: dict) -> UserAllocationRequest:
    """
    Example of data:
    {
        "userAddress": "0x123",
        "payload": {
            "allocations": [
                {
                    "proposalAddress": "0x456",
                    "amount": 100
                },
                {
                    "proposalAddress": "0x789",
                    "amount": 200
                }
            ],
            "nonce": 1,
            "signature": "0xabc"
        },
        "isManuallyEdited": False
    }
    """
    user_address = to_checksum_address(data["userAddress"])
    payload = data["payload"]
    allocations = [
        AllocationRequest(
            project_address=to_checksum_address(allocation_data["proposalAddress"]),
            amount=allocation_data["amount"],
        )
        for allocation_data in payload["allocations"]
    ]
    nonce = int(payload["nonce"])
    signature = payload.get("signature")
    is_manually_edited = data.get("isManuallyEdited", False)

    # fmt: off
    return UserAllocationRequest(
        user_address        = user_address,
        allocations         = allocations,
        nonce               = nonce,
        signature           = signature,
        is_manually_edited  = is_manually_edited,
    )
    # fmt: on


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
