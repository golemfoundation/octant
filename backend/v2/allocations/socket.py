import logging
from typing import Tuple

import socketio

from eth_utils import to_checksum_address
from v2.allocations.dependencies import (
    SignatureVerifierSettings,
    get_allocations,
    get_signature_verifier,
)
from v2.epochs.contracts import EpochsContracts
from v2.projects.services import (
    EstimatedProjectRewards,
    ProjectsAllocationThresholdGetter,
)
from v2.uniqueness_quotients.dependencies import UQScoreSettings, get_uq_score_getter
from v2.allocations.repositories import get_donations_by_project
from v2.allocations.services import Allocations
from v2.core.dependencies import (
    DatabaseSettings,
    Web3ProviderSettings,
    get_db_session,
    get_w3,
)
from v2.epochs.dependencies import (
    EpochsSettings,
    EpochsSubgraphSettings,
    get_epochs_contracts,
    get_epochs_subgraph,
)
from v2.projects.depdendencies import (
    EstimatedProjectMatchedRewardsSettings,
    ProjectsAllocationThresholdSettings,
    ProjectsSettings,
    get_estimated_project_matched_rewards,
    get_estimated_project_rewards,
    get_projects_contracts,
)
from v2.projects.depdendencies import get_projects_allocation_threshold_getter

from .schemas import AllocationRequest, UserAllocationRequest


from sqlalchemy.ext.asyncio import AsyncSession


class AllocateNamespace(socketio.AsyncNamespace):
    def create_dependencies_on_connect(
        self,
        session: AsyncSession,
    ) -> Tuple[
        ProjectsAllocationThresholdGetter, EstimatedProjectRewards, EpochsContracts
    ]:
        """
        Create and return all service dependencies.
        TODO: how could we cache this one ?
        """
        w3 = get_w3(Web3ProviderSettings())  # type: ignore
        projects_contracts = get_projects_contracts(w3, ProjectsSettings())
        threshold_getter = get_projects_allocation_threshold_getter(
            session, projects_contracts, ProjectsAllocationThresholdSettings()
        )
        epochs_contracts = get_epochs_contracts(w3, EpochsSettings())
        epochs_subgraph = get_epochs_subgraph(EpochsSubgraphSettings())
        estimated_matched_rewards = get_estimated_project_matched_rewards(
            session, epochs_subgraph, EstimatedProjectMatchedRewardsSettings()
        )
        estimated_project_rewards = get_estimated_project_rewards(
            session,
            projects_contracts,
            estimated_matched_rewards,
        )

        return (threshold_getter, estimated_project_rewards, epochs_contracts)

    async def handle_on_connect(
        self,
        epochs_contracts: EpochsContracts,
        projects_allocation_threshold_getter: ProjectsAllocationThresholdGetter,
        estimated_project_rewards: EstimatedProjectRewards,
    ):
        """
        Handle client connection
        """

        logging.debug("Client connected")

        pending_epoch_number = await epochs_contracts.get_pending_epoch()
        if pending_epoch_number is None:
            return

        # Get the allocation threshold and send it to the client
        allocation_threshold = await projects_allocation_threshold_getter.get(
            epoch_number=pending_epoch_number
        )
        await self.emit("threshold", {"threshold": str(allocation_threshold)})

        # Get the estimated project rewards and send them to the client
        project_rewards = await estimated_project_rewards.get(pending_epoch_number)
        rewards = [
            {
                "address": project_address,
                "allocated": str(project_rewards.amounts_by_project[project_address]),
                "matched": str(project_rewards.matched_by_project[project_address]),
            }
            for project_address in project_rewards.amounts_by_project.keys()
        ]

        await self.emit("project_rewards", rewards)

    async def on_connect(self, sid: str, environ: dict):
        async with get_db_session(DatabaseSettings()) as session:
            (
                projects_allocation_threshold_getter,
                estimated_project_rewards,
                epochs_contracts,
            ) = self.create_dependencies_on_connect(session)

            await self.handle_on_connect(
                epochs_contracts,
                projects_allocation_threshold_getter,
                estimated_project_rewards,
            )

    async def on_disconnect(self, sid):
        logging.debug("Client disconnected")

    def create_dependencies_on_allocate(
        self,
        session: AsyncSession,
    ) -> Tuple[
        Allocations,
        EpochsContracts,
        ProjectsAllocationThresholdGetter,
        EstimatedProjectRewards,
    ]:
        """
        Create and return all service dependencies.
        """

        w3 = get_w3(Web3ProviderSettings())
        epochs_contracts = get_epochs_contracts(w3, EpochsSettings())
        projects_contracts = get_projects_contracts(w3, ProjectsSettings())
        epochs_subgraph = get_epochs_subgraph(EpochsSubgraphSettings())
        threshold_getter = get_projects_allocation_threshold_getter(
            session, projects_contracts, ProjectsAllocationThresholdSettings()
        )
        estimated_matched_rewards = get_estimated_project_matched_rewards(
            session, epochs_subgraph, EstimatedProjectMatchedRewardsSettings()
        )
        estimated_project_rewards = get_estimated_project_rewards(
            session,
            projects_contracts,
            estimated_matched_rewards,
        )

        signature_verifier = get_signature_verifier(
            session, epochs_subgraph, projects_contracts, SignatureVerifierSettings()
        )

        uq_score_getter = get_uq_score_getter(session, UQScoreSettings())

        allocations = get_allocations(
            session,
            signature_verifier,
            uq_score_getter,
            projects_contracts,
            estimated_matched_rewards,
        )

        return (
            allocations,
            epochs_contracts,
            threshold_getter,
            estimated_project_rewards,
        )

    async def handle_on_allocate(
        self,
        session: AsyncSession,
        epochs_contracts: EpochsContracts,
        allocations: Allocations,
        threshold_getter: ProjectsAllocationThresholdGetter,
        estimated_project_rewards: EstimatedProjectRewards,
        data: dict,
    ):
        """
        Handle allocation request
        """

        # We do not handle requests outside of pending epoch state (Allocation Window)
        pending_epoch_number = await epochs_contracts.get_pending_epoch()
        if pending_epoch_number is None:
            return

        pending_epoch_number = 1
        request = from_dict(data)

        await allocations.make(pending_epoch_number, request)

        logging.debug("Allocation request handled")

        threshold = await threshold_getter.get(pending_epoch_number)
        await self.emit("threshold", {"threshold": str(threshold)})

        project_rewards = await estimated_project_rewards.get(pending_epoch_number)
        rewards = [
            {
                "address": project_address,
                "allocated": str(project_rewards.amounts_by_project[project_address]),
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

    async def on_allocate(self, sid: str, data: dict):
        async with get_db_session(DatabaseSettings()) as session:
            (
                allocations,
                epochs_contracts,
                threshold_getter,
                estimated_project_rewards,
            ) = self.create_dependencies_on_allocate(session)

            await self.handle_on_allocate(
                session,
                epochs_contracts,
                allocations,
                threshold_getter,
                estimated_project_rewards,
                data,
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

    return UserAllocationRequest(
        user_address=user_address,
        allocations=allocations,
        nonce=nonce,
        signature=signature,
        is_manually_edited=is_manually_edited,
    )
