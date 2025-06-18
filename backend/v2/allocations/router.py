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

    This endpoint allows users to allocate their rewards to different projects. The request must be signed
    using EIP-712 standard and include a valid nonce to prevent replay attacks.

    Request Body:
        - user_address: The Ethereum address of the user making the allocation
        - payload:
            - allocations: List of allocation requests, each containing:
                - proposalAddress: The address of the project to allocate to
                - amount: The amount to allocate to the project (can be 0 for self-withdrawal)
            - nonce: A sequential number that must match the user's next expected nonce
        - signature: EIP-712 signature of the allocation request
        - is_manually_edited: Boolean indicating if the allocation was manually edited

    Self-Withdrawal:
        There are two ways to withdraw rewards to yourself:

        1. Full Self-Withdrawal (ALL rewards):
           - Include at least one project allocation with amount 0
           - You can include multiple projects, all with amount 0
           - This will result in ALL rewards eligible for withdrawal

        2. Partial Self-Withdrawal:
           - Include allocations to projects with non-zero amounts
           - The sum of all allocation amounts must be less than your total budget
           - The remaining amount (budget - sum of allocations) will be sent to your address

    Validation Rules:
        - The request must be made during the allocation window
        - The nonce must match the user's next expected nonce
        - The user must not be in patron mode
        - The user must have sufficient budget for the allocations
        - The user cannot allocate to themselves if they are a project
        - All project addresses must be valid
        - No duplicate project allocations are allowed
        - The signature must be valid according to EIP-712 standard

    Returns:
        201: Allocation request successfully processed
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


@api.get("/donors/{epoch_number}")
async def get_donors_for_epoch_v1(
    session: GetSession, epoch_number: int
) -> EpochDonorsResponseV1:
    """
    Get the list of donors for a given epoch.

    This endpoint returns all unique addresses that have made allocations during the specified epoch.
    A donor is considered anyone who has made at least one allocation, regardless of the amount.

    Path Parameters:
        - epoch_number: The epoch number to get donors for

    Returns:
        EpochDonorsResponseV1 containing:
            - donors: List of Ethereum addresses that made allocations in the epoch

    Note:
        - The list includes all donors, even those who only made zero-amount allocations
        - The list is unique (no duplicate addresses)
        - The order of addresses is not guaranteed
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

    This endpoint returns the final allocation state for each donor-project pair in the specified epoch.
    For each donor, only their latest allocation to each project is returned.

    Path Parameters:
        - epoch_number: The epoch number to get allocations for

    Query Parameters:
        - includeZeroAllocations: If true, includes allocations with zero amount. Defaults to false.

    Returns:
        EpochAllocationsResponseV1 containing:
            - allocations: List of ProjectDonationV1 objects, each containing:
                - donor: Ethereum address of the donor
                - project: Ethereum address of the project
                - amount: The allocated amount

    Note:
        - Only the latest allocation from each donor to each project is returned
        - If includeZeroAllocations is false, allocations with amount 0 are excluded
        - The order of allocations is not guaranteed
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

    This endpoint allows users to preview the impact of their allocations before submitting them.
    It calculates the leverage, threshold, and matched rewards that would result from the proposed allocations.

    Path Parameters:
        - user_address: The Ethereum address of the user to simulate allocations for

    Request Body:
        - allocations: List of allocation requests, each containing:
            - proposalAddress: The address of the project to allocate to
            - amount: The amount to allocate to the project

    Returns:
        SimulateAllocationResponseV1 containing:
            - leverage: The calculated leverage value
            - threshold: The threshold value (if applicable)
            - matched: List of ProjectMatchedRewardsV1 objects, each containing:
                - address: Project address
                - value: Matched rewards amount

    Note:
        - This is a simulation and does not actually submit any allocations
        - Only available during the allocation window
        - Results are based on the current state of the system
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

    This endpoint returns all allocations made to a specific project during the specified epoch.
    For each donor, only their latest allocation to the project is returned.

    Path Parameters:
        - project_address: The Ethereum address of the project
        - epoch_number: The epoch number to get allocations for

    Returns:
        List of ProjectAllocationV1 objects, each containing:
            - address: Ethereum address of the donor
            - amount: The allocated amount

    Note:
        - Only the latest allocation from each donor is returned
        - The order of allocations is not guaranteed
    """
    return await get_donations_by_project(session, project_address, epoch_number)


@api.get("/user/{user_address}/epoch/{epoch_number}")
async def get_user_allocations_for_epoch_v1(
    session: GetSession, user_address: Address, epoch_number: int
) -> UserAllocationsResponseV1:
    """
    Returns all latest allocations for a given user in a particular epoch.

    This endpoint returns the final allocation state for a specific user in the specified epoch.
    For each project, only the user's latest allocation is returned.

    Path Parameters:
        - user_address: The Ethereum address of the user
        - epoch_number: The epoch number to get allocations for

    Returns:
        UserAllocationsResponseV1 containing:
            - allocations: List of ProjectAllocationV1 objects, each containing:
                - address: Project address
                - amount: The allocated amount
            - is_manually_edited: Boolean indicating if the user's allocations were manually edited

    Note:
        - Only the latest allocation to each project is returned
        - The order of allocations is not guaranteed
        - is_manually_edited will be null if no allocation request exists
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

    This endpoint returns the next expected nonce value for a user's allocation request.
    The nonce is used to prevent replay attacks and must be included in the allocation request signature.

    Path Parameters:
        - user_address: The Ethereum address of the user

    Returns:
        UserAllocationNonceV1 containing:
            - allocation_nonce: The next expected nonce value

    Note:
        - The nonce starts at 0 for new users
        - Each successful allocation increments the nonce
        - The nonce must be included in the EIP-712 signature of allocation requests
    """
    nonce = await get_next_user_nonce(session, user_address)
    return UserAllocationNonceV1(allocation_nonce=nonce)
