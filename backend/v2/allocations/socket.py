import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Tuple

import socketio
from sqlalchemy.ext.asyncio import AsyncSession
from v2.allocations.dependencies import get_allocator, get_signature_verifier
from v2.allocations.repositories import get_donations_by_project
from v2.allocations.services import Allocator
from v2.core.dependencies import (
    get_chain_settings,
    get_database_settings,
    get_sessionmaker,
    get_w3,
    get_web3_provider_settings,
)
from v2.core.exceptions import AllocationWindowClosed
from v2.epochs.dependencies import (
    assert_allocation_window_open,
    get_epochs_contracts,
    get_epochs_settings,
    get_epochs_subgraph,
    get_epochs_subgraph_settings,
)
from v2.matched_rewards.dependencies import (
    get_matched_rewards_estimator,
    get_matched_rewards_estimator_settings,
)
from v2.project_rewards.dependencies import get_project_rewards_estimator
from v2.project_rewards.services import ProjectRewardsEstimator
from v2.projects.dependencies import (
    get_projects_allocation_threshold_getter,
    get_projects_allocation_threshold_settings,
    get_projects_contracts,
    get_projects_settings,
)
from v2.projects.services import ProjectsAllocationThresholdGetter
from v2.uniqueness_quotients.dependencies import get_uq_score_getter, get_uq_score_settings

from .schemas import UserAllocationRequest, UserAllocationRequestV1


@asynccontextmanager
async def create_dependencies_on_connect() -> AsyncGenerator[
    Tuple[AsyncSession, ProjectsAllocationThresholdGetter, ProjectRewardsEstimator],
    None,
]:
    """
    Create and return all service dependencies.
    """
    w3 = get_w3(get_web3_provider_settings())
    epochs_contracts = get_epochs_contracts(w3, get_epochs_settings())

    # We do not handle requests outside of pending epoch state (Allocation Window)
    # This will raise an exception if the allocation window is closed and connection does not happen
    epoch_number = await assert_allocation_window_open(epochs_contracts)

    projects_contracts = get_projects_contracts(w3, get_projects_settings())
    epochs_subgraph = get_epochs_subgraph(get_epochs_subgraph_settings())

    # For safety, we create separate sessions for each dependency
    #  (to avoid any potential issues with session sharing in async task context)

    sessionmaker = get_sessionmaker(get_database_settings())

    async with (
        sessionmaker() as s1,
        sessionmaker() as s2,
        sessionmaker() as s3,
        sessionmaker() as s4,
    ):
        try:
            threshold_getter = get_projects_allocation_threshold_getter(
                epoch_number,
                s1,
                projects_contracts,
                get_projects_allocation_threshold_settings(),
            )
            estimated_matched_rewards = await get_matched_rewards_estimator(
                epoch_number,
                s2,
                epochs_subgraph,
                get_matched_rewards_estimator_settings(),
            )
            estimated_project_rewards = await get_project_rewards_estimator(
                epoch_number,
                s3,
                projects_contracts,
                estimated_matched_rewards,
            )

            # Yield the dependencies to the on_connect handler
            yield (s4, threshold_getter, estimated_project_rewards)

        except Exception:
            await asyncio.gather(
                s1.rollback(),
                s2.rollback(),
                s3.rollback(),
                s4.rollback(),
            )
            raise
        finally:
            await asyncio.gather(
                s1.close(),
                s2.close(),
                s3.close(),
                s4.close(),
            )


@asynccontextmanager
async def create_dependencies_on_allocate() -> AsyncGenerator[
    Tuple[
        AsyncSession,
        Allocator,
        ProjectsAllocationThresholdGetter,
        ProjectRewardsEstimator,
    ],
    None,
]:
    """
    Create and return all service dependencies.
    """

    w3 = get_w3(get_web3_provider_settings())
    epochs_contracts = get_epochs_contracts(w3, get_epochs_settings())

    # We do not handle requests outside of pending epoch state (Allocation Window)
    # This will raise an exception if the allocation window is closed and connection does not happen
    epoch_number = await assert_allocation_window_open(epochs_contracts)

    projects_contracts = get_projects_contracts(w3, get_projects_settings())
    epochs_subgraph = get_epochs_subgraph(get_epochs_subgraph_settings())

    # For safety, we create separate sessions for each dependency
    #  (to avoid any potential issues with session sharing in async task context)
    sessionmaker = get_sessionmaker(get_database_settings())

    async with (
        sessionmaker() as s1,
        sessionmaker() as s2,
        sessionmaker() as s3,
        sessionmaker() as s4,
        sessionmaker() as s5,
        sessionmaker() as s6,
        sessionmaker() as s7,
    ):
        try:
            threshold_getter = get_projects_allocation_threshold_getter(
                epoch_number,
                s1,
                projects_contracts,
                get_projects_allocation_threshold_settings(),
            )
            estimated_matched_rewards = await get_matched_rewards_estimator(
                epoch_number,
                s2,
                epochs_subgraph,
                get_matched_rewards_estimator_settings(),
            )
            estimated_project_rewards = await get_project_rewards_estimator(
                epoch_number,
                s3,
                projects_contracts,
                estimated_matched_rewards,
            )

            signature_verifier = get_signature_verifier(
                s4,
                epochs_subgraph,
                projects_contracts,
                get_chain_settings(),
            )

            uq_score_getter = get_uq_score_getter(s5, get_uq_score_settings())

            allocations = await get_allocator(
                epoch_number,
                s6,
                signature_verifier,
                uq_score_getter,
                projects_contracts,
                estimated_matched_rewards,
            )

            # Yield the dependencies to the on_allocate handler
            yield (
                s7,
                allocations,
                threshold_getter,
                estimated_project_rewards,
            )

        except Exception:
            await asyncio.gather(
                s1.rollback(),
                s2.rollback(),
                s3.rollback(),
                s4.rollback(),
                s5.rollback(),
                s6.rollback(),
                s7.rollback(),
            )
            raise
        finally:
            await asyncio.gather(
                s1.close(),
                s2.close(),
                s3.close(),
                s4.close(),
                s5.close(),
                s6.close(),
                s7.close(),
            )


class AllocateNamespace(socketio.AsyncNamespace):
    async def handle_on_connect(self, sid: str, environ: dict):
        async with create_dependencies_on_connect() as (
            session,
            threshold_getter,
            estimated_project_rewards,
        ):
            logging.debug("Client connected")

            # Get the allocation threshold and send it to the client
            allocation_threshold = await threshold_getter.get()

            await self.emit(
                "threshold", {"threshold": str(allocation_threshold)}, to=sid
            )

            # Get the estimated project rewards and send them to the client
            project_rewards = await estimated_project_rewards.get()

            await self.emit(
                "project_rewards",
                [
                    p.model_dump(by_alias=True)
                    for p in project_rewards.project_fundings.values()
                ],
                to=sid,
            )

            for project_address in project_rewards.project_fundings:
                donations = await get_donations_by_project(
                    session=session,
                    project_address=project_address,
                    epoch_number=estimated_project_rewards.epoch_number,
                )

                await self.emit(
                    "project_donors",
                    {
                        "project": project_address,
                        "donors": [
                            {
                                "address": d.donor_address,
                                "amount": str(d.amount),
                            }
                            for d in donations
                        ],
                    },
                )

    async def on_connect(self, sid: str, environ: dict):
        try:
            await self.handle_on_connect(sid, environ)
        except AllocationWindowClosed:
            logging.info("Allocation window is closed, connection not established")
        except Exception as e:
            logging.error(f"Error handling on_connect: {e}")

    async def on_disconnect(self, sid):
        logging.debug("Client disconnected")

    async def handle_on_allocate(self, sid: str, data: str):
        async with create_dependencies_on_allocate() as (
            session,
            allocations,
            threshold_getter,
            estimated_project_rewards,
        ):
            request = from_dict(data)

            await allocations.handle(request)

            logging.debug("Allocation request handled")

            # Get the allocation threshold and send it to the client
            allocation_threshold = await threshold_getter.get()

            await self.emit(
                "threshold", {"threshold": str(allocation_threshold)}, to=sid
            )

            # Get the estimated project rewards and send them to the client
            project_rewards = await estimated_project_rewards.get()
            await self.emit(
                "project_rewards",
                [
                    p.model_dump(by_alias=True)
                    for p in project_rewards.project_fundings.values()
                ],
                to=sid,
            )

            for project_address in project_rewards.project_fundings:
                donations = await get_donations_by_project(
                    session=session,
                    project_address=project_address,
                    epoch_number=estimated_project_rewards.epoch_number,
                )

                await self.emit(
                    "project_donors",
                    {
                        "project": project_address,
                        "donors": [
                            {
                                "address": d.donor_address,
                                "amount": str(d.amount),
                            }
                            for d in donations
                        ],
                    },
                )

    async def on_allocate(self, sid: str, data: str):
        try:
            await self.handle_on_allocate(sid, data)

        except AllocationWindowClosed:
            logging.info("Allocation window is closed, allocation not processed")

        except Exception as e:
            logging.error(f"Error handling on_allocate: {e}")


def from_dict(data: str) -> UserAllocationRequest:
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

    # TODO: maybe we can switcht to UserAllocationRequest from V1 ?
    # parse the incoming data as UserAllocationRequestV1
    requestV1 = UserAllocationRequestV1.model_validate_json(data)
    request = UserAllocationRequest(
        userAddress=requestV1.user_address,
        allocations=requestV1.payload.allocations,
        nonce=requestV1.payload.nonce,
        signature=requestV1.signature,
        isManuallyEdited=requestV1.is_manually_edited,
    )
    return request
