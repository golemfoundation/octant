import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Tuple

import socketio
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import OctantException
from v2.allocations.dependencies import get_allocator, get_signature_verifier
from v2.allocations.repositories import get_donations_by_project
from v2.allocations.schemas import UserAllocationRequest, UserAllocationRequestV1
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
    get_epochs_contracts,
    get_epochs_settings,
    get_epochs_subgraph,
    get_epochs_subgraph_settings,
    get_open_allocation_window_epoch_number,
)
from v2.matched_rewards.dependencies import (
    get_matched_rewards_estimator_only_in_aw,
    get_matched_rewards_estimator_settings,
)
from v2.project_rewards.dependencies import get_project_rewards_estimator
from v2.project_rewards.services import ProjectRewardsEstimator
from v2.projects.dependencies import (
    get_projects_allocation_threshold_getter_in_open_aw,
    get_projects_contracts,
    get_projects_settings,
)
from v2.projects.services.projects_allocation_threshold_getter import (
    ProjectsAllocationThresholdGetter,
)
from v2.uniqueness_quotients.dependencies import (
    get_timeout_list,
    get_uq_score_getter,
    get_uq_score_settings,
)


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
    epoch_number = await get_open_allocation_window_epoch_number(epochs_contracts)

    projects_contracts = get_projects_contracts(w3, get_projects_settings())
    epochs_subgraph = get_epochs_subgraph(get_epochs_subgraph_settings())

    sessionmaker = get_sessionmaker(get_database_settings())

    async with sessionmaker() as session:
        try:
            threshold_getter = get_projects_allocation_threshold_getter_in_open_aw(
                epoch_number,
                session,
                projects_contracts,
            )
            estimated_matched_rewards = await get_matched_rewards_estimator_only_in_aw(
                epoch_number,
                session,
                epochs_subgraph,
                get_matched_rewards_estimator_settings(),
            )
            estimated_project_rewards = await get_project_rewards_estimator(
                epoch_number,
                session,
                projects_contracts,
                estimated_matched_rewards,
            )

            # Yield the dependencies to the on_connect handler
            yield (session, threshold_getter, estimated_project_rewards)

        except Exception as e:
            await safe_session_cleanup(session)
            raise e


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
    epoch_number = await get_open_allocation_window_epoch_number(epochs_contracts)

    projects_contracts = get_projects_contracts(w3, get_projects_settings())
    epochs_subgraph = get_epochs_subgraph(get_epochs_subgraph_settings())

    # For safety, we create separate sessions for each dependency
    #  (to avoid any potential issues with session sharing in async task context)
    sessionmaker = get_sessionmaker(get_database_settings())

    async with sessionmaker() as session:
        try:
            threshold_getter = get_projects_allocation_threshold_getter_in_open_aw(
                epoch_number,
                session,
                projects_contracts,
            )
            estimated_matched_rewards = await get_matched_rewards_estimator_only_in_aw(
                epoch_number,
                session,
                epochs_subgraph,
                get_matched_rewards_estimator_settings(),
            )
            estimated_project_rewards = await get_project_rewards_estimator(
                epoch_number,
                session,
                projects_contracts,
                estimated_matched_rewards,
            )

            chain_settings = get_chain_settings()
            signature_verifier = get_signature_verifier(
                session,
                epochs_subgraph,
                projects_contracts,
                chain_settings,
            )

            timeout_list = get_timeout_list(chain_settings)
            uq_score_getter = get_uq_score_getter(
                session,
                get_uq_score_settings(),
                chain_settings,
                timeout_list,
            )

            allocations = await get_allocator(
                epoch_number,
                session,
                signature_verifier,
                uq_score_getter,
                projects_contracts,
                estimated_matched_rewards,
            )

            # Yield the dependencies to the on_allocate handler
            yield (
                session,
                allocations,
                threshold_getter,
                estimated_project_rewards,
            )

        except Exception as e:
            await safe_session_cleanup(session)
            raise e


class AllocateNamespace(socketio.AsyncNamespace):
    async def handle_on_connect(self, sid: str, environ: dict):
        async with create_dependencies_on_connect() as (
            session,
            threshold_getter,
            estimated_project_rewards,
        ):
            logging.info(f"Client {sid} connected")

            # Get the allocation threshold and send it to the client
            allocation_threshold = await threshold_getter.get()

            logging.info(f"Emitting threshold to client {sid}: {allocation_threshold}")
            await self.emit(
                "threshold", {"threshold": str(allocation_threshold)}, to=sid
            )

            # Get the estimated project rewards and send them to the client
            project_rewards = await estimated_project_rewards.get()

            logging.info(f"Emitting project_rewards to client {sid}")
            await self.emit(
                "project_rewards",
                [
                    p.model_dump(by_alias=True)
                    for p in project_rewards.project_fundings.values()
                ],
                to=sid,
            )

            logging.info(f"Emitting project_donors foreach project to client {sid}")

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
                                "address": d.address,
                                "amount": str(d.amount),
                            }
                            for d in donations
                        ],
                    },
                    to=sid,
                )

    async def on_connect(self, sid: str, environ: dict):
        try:
            await self.handle_on_connect(sid, environ)

        except AllocationWindowClosed:
            logging.info("Allocation window is closed, connection not established")

        except OctantException as e:
            logging.error(f"OctantException({e.__class__.__name__}): {e}")

        except Exception as e:
            logging.error(f"Error handling on_connect ({e.__class__.__name__}): {e}")

    async def on_disconnect(self, sid):
        logging.debug("Client disconnected")

    async def handle_on_allocate(self, sid: str, data: str):
        logging.info(f"Received allocation data from client {sid}: {data}")
        async with create_dependencies_on_allocate() as (
            session,
            allocations,
            threshold_getter,
            estimated_project_rewards,
        ):
            request = from_dict(data)

            logging.info(
                f"Handling allocation request for client {sid} as user {request.user_address}"
            )

            await allocations.handle(request)

            logging.debug("Allocation request handled")

            # Get the allocation threshold and send it to the client
            allocation_threshold = await threshold_getter.get()

            logging.info(f"Emitting threshold to client {sid}: {allocation_threshold}")
            await self.emit(
                "threshold", {"threshold": str(allocation_threshold)}, to=sid
            )

            # Get the estimated project rewards and send them to the client
            project_rewards = await estimated_project_rewards.get()
            logging.info(f"Emitting project_rewards to client {sid}")
            await self.emit(
                "project_rewards",
                [
                    p.model_dump(by_alias=True)
                    for p in project_rewards.project_fundings.values()
                ],
                to=sid,
            )

            logging.info(f"Emitting project_donors foreach project to client {sid}")

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
                                "address": d.address,
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
            logging.info("Allocation window is closed, connection not established")

        except OctantException as e:
            logging.error(f"OctantException({e.__class__.__name__}): {e.message}")

        except Exception as e:
            logging.error(f"Error handling on_allocate ({e.__class__.__name__}): {e}")


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
        user_address=requestV1.user_address,
        allocations=requestV1.payload.allocations,
        nonce=requestV1.payload.nonce,
        signature=requestV1.signature,
        is_manually_edited=requestV1.is_manually_edited,
    )
    return request


async def safe_session_cleanup(session: AsyncSession):
    try:
        await session.rollback()
    except Exception:
        # Log the rollback error, but don't raise it
        logging.exception("Error during session rollback")
    finally:
        try:
            await session.close()
        except Exception:
            # Log the close error, but don't raise it
            logging.exception("Error during session close")
