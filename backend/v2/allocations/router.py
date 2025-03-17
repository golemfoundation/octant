from typing import Annotated
from fastapi import APIRouter, Query
from v2.matched_rewards.dependencies import GetMatchedRewardsEstimatorInAW
from v2.projects.dependencies import GetProjectsContracts
from v2.uniqueness_quotients.dependencies import GetUQScoreGetter
from v2.allocations.services import simulate_allocation
from v2.epochs.dependencies import GetOpenAllocationWindowEpochNumber
from v2.allocations.repositories import (
    get_all_allocations_for_epoch,
    get_allocations_by_user,
    get_donations_by_project,
    get_donors_for_epoch,
    get_last_allocation_request,
)
from v2.allocations.validators import get_next_user_nonce
from v2.core.dependencies import GetSession
from v2.core.types import Address
from v2.allocations.dependencies import GetAllocator
from v2.allocations.schemas import (
    EpochAllocationsResponseV1,
    EpochDonorsResponseV1,
    ProjectAllocationV1,
    SimulateAllocationPayloadV1,
    SimulateAllocationResponseV1,
    UserAllocationNonceV1,
    UserAllocationRequest,
    UserAllocationRequestV1,
    UserAllocationsResponseV1,
)

api = APIRouter(prefix="/allocations", tags=["Allocations"])

# _v1 suffix is to indicate that this is the 1:1 contract of the old (flask) API


@api.post("/allocate", status_code=201)
async def allocate_v1(
    # Component dependencies
    allocator: GetAllocator,
    # Request Parameters
    allocation_request: UserAllocationRequestV1,
) -> None:
    """
    Request an allocation for the user.
    Only available during the allocation window.
    """

    # TODO: We should ideally move to the newer version of the schema as it's simpler
    request = UserAllocationRequest(
        user_address=allocation_request.user_address,
        allocations=allocation_request.payload.allocations,
        nonce=allocation_request.payload.nonce,
        signature=allocation_request.signature,
        is_manually_edited=allocation_request.is_manually_edited,
    )

    await allocator.handle(request)


# TODO: this API could be better (route + response model)
@api.get("/donors/{epoch_number}")
async def get_donors_for_epoch_v1(
    session: GetSession, epoch_number: int
) -> EpochDonorsResponseV1:
    """
    Get the list of donors for a given epoch.
    """
    donors = await get_donors_for_epoch(session, epoch_number)
    return EpochDonorsResponseV1(donors=donors)


@api.get("/epoch/{epoch_number}")
async def get_all_allocations_for_epoch_v1(
    session: GetSession,
    epoch_number: int,
    include_zero_allocations: Annotated[
        bool,
        Query(
            alias="includeZeroAllocations",
            description="Include zero allocations to projects. Defaults to false.",
        ),
    ] = False,
) -> EpochAllocationsResponseV1:
    """
    Returns all latest allocations in a particular epoch.
    """
    donations = await get_all_allocations_for_epoch(
        session, epoch_number, include_zero_allocations
    )
    return EpochAllocationsResponseV1(allocations=donations)


@api.post("/leverage/{user_address}")
async def simulate_allocation_v1(
    session: GetSession,
    projects_contracts: GetProjectsContracts,
    matched_rewards_estimator: GetMatchedRewardsEstimatorInAW,
    uq_score_getter: GetUQScoreGetter,
    pending_epoch_number: GetOpenAllocationWindowEpochNumber,
    # Request Parameters
    user_address: Address,
    payload: SimulateAllocationPayloadV1,
) -> SimulateAllocationResponseV1:
    """
    Simulates an allocation and get the expected leverage, threshold and matched rewards.
    """
    return await simulate_allocation(
        session,
        projects_contracts,
        matched_rewards_estimator,
        uq_score_getter,
        pending_epoch_number,
        user_address,
        payload.allocations,
    )


@api.get("/project/{project_address}/epoch/{epoch_number}")
async def get_project_allocations_for_epoch_v1(
    session: GetSession, project_address: Address, epoch_number: int
) -> list[ProjectAllocationV1]:
    """
    Returns list of allocations for a given project in a particular epoch.
    """
    return await get_donations_by_project(session, project_address, epoch_number)


# TODO: Here we have inconsisteny in the naming of the endpoint
@api.get("/user/{user_address}/epoch/{epoch_number}")
async def get_user_allocations_for_epoch_v1(
    session: GetSession, user_address: Address, epoch_number: int
) -> UserAllocationsResponseV1:
    """
    Returns all latest allocations for a given user in a particular epoch.
    """
    allocations = await get_allocations_by_user(session, user_address, epoch_number)
    last_alloc_request = await get_last_allocation_request(
        session, user_address, epoch_number
    )

    return UserAllocationsResponseV1(
        allocations=allocations,
        is_manually_edited=last_alloc_request.is_manually_edited
        if last_alloc_request
        else None,
    )


@api.get("/users/{user_address}/allocation_nonce")
async def get_user_next_allocation_nonce_v1(
    session: GetSession, user_address: Address
) -> UserAllocationNonceV1:
    """
    Returns current value of allocation nonce. It is needed to sign allocations.
    """
    nonce = await get_next_user_nonce(session, user_address)
    return UserAllocationNonceV1(allocation_nonce=nonce)
