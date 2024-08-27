import logging

import socketio

# from app.extensions import socketio, epochs
from eth_utils import to_checksum_address
from v2.allocations.repositories import get_donations_by_project
from v2.allocations.services import allocate
from v2.core.dependencies import db_getter
from v2.epochs.dependencies import epochs_getter, epochs_subgraph_getter
from v2.projects.depdendencies import projects_getter
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

        logging.debug("Client connected")

        # We send the data only in PENDING state
        pending_epoch_number = await self.epochs_contracts.get_pending_epoch()
        if pending_epoch_number is None:
            return

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

        await self.emit("project_rewards", rewards)

    async def on_disconnect(self, sid):
        logging.debug("Client disconnected")

    async def on_allocate(self, sid: str, data: dict):
        """
        Handle allocation request
        """

        # We do not handle requests outside of pending epoch state (Allocation Window)
        pending_epoch_number = await self.epochs_contracts.get_pending_epoch()
        if pending_epoch_number is None:
            return

        request = from_dict(data)

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
