from decimal import Decimal

from app import exceptions
from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from sqlalchemy.ext.asyncio import AsyncSession
from v2.crypto.signatures import verify_signed_message
from v2.epochs.subgraphs import EpochsSubgraph
from v2.project_rewards.capped_quadriatic import (
    capped_quadriatic_funding,
    cqf_calculate_individual_leverage,
)
from v2.projects.contracts import ProjectsContracts
from v2.projects.services import get_estimated_project_matched_rewards_pending
from v2.uniqueness_quotients.services import get_or_calculate_uq_score
from v2.user_patron_mode.repositories import (
    get_budget_by_user_address_and_epoch,
    user_is_patron_with_budget,
)
from v2.users.repositories import get_user_by_address
from web3 import AsyncWeb3

from .models import AllocationWithUserUQScore, UserAllocationRequest
from .repositories import (
    get_allocations_with_user_uqs,
    get_last_allocation_request_nonce,
    soft_delete_user_allocations_by_epoch,
    store_allocation_request,
)


async def allocate(
    # Component dependencies
    session: AsyncSession,
    projects_contracts: ProjectsContracts,
    epochs_subgraph: EpochsSubgraph,
    # Arguments
    epoch_number: int,
    request: UserAllocationRequest,
    # Settings
    uq_score_threshold: float = 21.0,
    low_uq_score: Decimal = Decimal("0.2"),
    max_uq_score: Decimal = Decimal("1.0"),
    chain_id: int = 11155111,
) -> str:
    await verify_logic(
        session=session,
        epoch_subgraph=epochs_subgraph,
        projects_contracts=projects_contracts,
        epoch_number=epoch_number,
        payload=request,
    )
    await verify_signature(
        w3=projects_contracts.w3,
        chain_id=chain_id,
        user_address=request.user_address,
        payload=request,
    )

    # Get user
    # ? Do we need to get the user here ?
    # user = await get_user_by_address(session, request.user_address)

    # Get or calculate UQ score of the user
    # TODO: k=v arguments
    user_uq_score = await get_or_calculate_uq_score(
        session=session,
        user_address=request.user_address,
        epoch_number=epoch_number,
        uq_score_threshold=uq_score_threshold,
        max_uq_score=max_uq_score,
        low_uq_score=low_uq_score,
    )

    # Calculate leverage by simulating the allocation
    new_allocations = [
        AllocationWithUserUQScore(
            project_address=a.project_address,
            amount=a.amount,
            user_address=request.user_address,
            user_uq_score=user_uq_score,
        )
        for a in request.allocations
    ]
    leverage = await calculate_leverage(
        session=session,
        projects=projects_contracts,
        epochs_subgraph=epochs_subgraph,
        epoch_number=epoch_number,
        user_address=request.user_address,
        new_allocations=new_allocations,
    )

    await soft_delete_user_allocations_by_epoch(
        session,
        user_address=request.user_address,
        epoch_number=epoch_number,
    )

    # Get user and update allocation nonce
    user = await get_user_by_address(session, request.user_address)
    if user is None:
        raise exceptions.UserNotFound(request.user_address)

    user.allocation_nonce = request.nonce

    await store_allocation_request(
        session,
        request.user_address,
        epoch_number,
        request,
        leverage=leverage,
    )

    # Commit the transaction
    await session.commit()

    return request.user_address


async def calculate_leverage(
    # Component dependencies
    session: AsyncSession,
    projects: ProjectsContracts,
    epochs_subgraph: EpochsSubgraph,
    # Arguments
    epoch_number: int,
    user_address: str,
    new_allocations: list[AllocationWithUserUQScore],
) -> float:
    """
    Calculate leverage of the allocation made by the user.
    """

    all_projects = await projects.get_project_addresses(epoch_number)

    matched_rewards = await get_estimated_project_matched_rewards_pending(
        session=session,
        epochs_subgraph=epochs_subgraph,
        epoch_number=epoch_number,
    )

    # Get all allocations before user's allocation
    existing_allocations = await get_allocations_with_user_uqs(session, epoch_number)
    # Remove allocations made by this user (as they will be removed in a second)
    allocations_without_user = [
        a for a in existing_allocations if a.user_address != user_address
    ]

    # Calculate funding without user's allocations
    before = capped_quadriatic_funding(
        allocations=allocations_without_user,
        matched_rewards=matched_rewards,
        project_addresses=all_projects,
    )

    # Calculate funding with user's allocations
    after = capped_quadriatic_funding(
        allocations=allocations_without_user + new_allocations,
        matched_rewards=matched_rewards,
        project_addresses=all_projects,
    )

    # Calculate leverage based on the difference in funding
    return cqf_calculate_individual_leverage(
        new_allocations_amount=sum(a.amount for a in new_allocations),
        project_addresses=[a.project_address for a in new_allocations],
        before_allocation_matched=before.matched_by_project,
        after_allocation_matched=after.matched_by_project,
    )


async def verify_logic(
    # Component dependencies
    session: AsyncSession,
    epoch_subgraph: EpochsSubgraph,
    projects_contracts: ProjectsContracts,
    # Arguments
    epoch_number: int,
    payload: UserAllocationRequest,
):
    # Check if the epoch is in the decision window
    # epoch_details = await epoch_subgraph.get_epoch_by_number(epoch_number)
    # if epoch_details.state != "PENDING":
    #     raise exceptions.NotInDecision

    # Check if the allocations are not empty
    if not payload.allocations:
        raise exceptions.EmptyAllocations()

    # Check if the nonce is as expected
    expected_nonce = await get_next_user_nonce(session, payload.user_address)
    if payload.nonce != expected_nonce:
        raise exceptions.WrongAllocationsNonce(payload.nonce, expected_nonce)

    # Check if the user is not a patron
    epoch_details = await epoch_subgraph.get_epoch_by_number(epoch_number)
    is_patron = await user_is_patron_with_budget(
        session,
        payload.user_address,
        epoch_number,
        epoch_details.finalized_timestamp.datetime(),
    )
    if is_patron:
        raise exceptions.NotAllowedInPatronMode(payload.user_address)

    # Check if the user is not a project
    all_projects = await projects_contracts.get_project_addresses(epoch_number)
    if payload.user_address in all_projects:
        raise exceptions.ProjectAllocationToSelf()

    project_addresses = [a.project_address for a in payload.allocations]

    # Check if the projects are valid
    invalid_projects = set(project_addresses) - set(all_projects)
    if invalid_projects:
        raise exceptions.InvalidProjects(invalid_projects)

    # Check if there are no duplicates
    duplicates = [p for p in project_addresses if project_addresses.count(p) > 1]
    if duplicates:
        raise exceptions.DuplicatedProjects(duplicates)

    # Get the user's budget
    user_budget = await get_budget_by_user_address_and_epoch(
        session, payload.user_address, epoch_number
    )

    # if user_budget is None:
    #     raise exceptions.BudgetNotFound(payload.user_address, epoch_number)

    # # Check if the allocations are within the budget
    # if sum(a.amount for a in payload.allocations) > user_budget:
    #     raise exceptions.RewardsBudgetExceeded()


async def get_next_user_nonce(
    # Component dependencies
    session: AsyncSession,
    # Arguments
    user_address: str,
) -> int:
    """
    Get the next expected nonce for the user.
    It's a simple increment of the last nonce, or 0 if there is no previous nonce.
    """
    # Get the last allocation request of the user
    last_allocation_request = await get_last_allocation_request_nonce(
        session, user_address
    )

    # Calculate the next nonce
    if last_allocation_request is None:
        return 0

    # Increment the last nonce
    return last_allocation_request + 1


async def verify_signature(
    w3: AsyncWeb3, chain_id: int, user_address: str, payload: UserAllocationRequest
) -> None:
    eip712_encoded = build_allocations_eip712_structure(chain_id, payload)
    encoded_msg = encode_for_signing(EncodingStandardFor.DATA, eip712_encoded)

    # Verify the signature
    is_valid = await verify_signed_message(
        w3, user_address, encoded_msg, payload.signature
    )
    if not is_valid:
        raise exceptions.InvalidSignature(user_address, payload.signature)


def build_allocations_eip712_structure(chain_id: int, payload: UserAllocationRequest):
    message = {}
    message["allocations"] = [
        {"proposalAddress": a.project_address, "amount": a.amount}
        for a in payload.allocations
    ]
    message["nonce"] = payload.nonce  # type: ignore
    return build_allocations_eip712_data(chain_id, message)


def build_allocations_eip712_data(chain_id: int, message: dict) -> dict:
    # Convert amount value to int
    message["allocations"] = [
        {**allocation, "amount": int(allocation["amount"])}
        for allocation in message["allocations"]
    ]

    allocation_types = {
        "EIP712Domain": [
            {"name": "name", "type": "string"},
            {"name": "version", "type": "string"},
            {"name": "chainId", "type": "uint256"},
        ],
        "Allocation": [
            {"name": "proposalAddress", "type": "address"},
            {"name": "amount", "type": "uint256"},
        ],
        "AllocationPayload": [
            {"name": "allocations", "type": "Allocation[]"},
            {"name": "nonce", "type": "uint256"},
        ],
    }

    return {
        "types": allocation_types,
        "domain": {
            "name": "Octant",
            "version": "1.0.0",
            "chainId": chain_id,
        },
        "primaryType": "AllocationPayload",
        "message": message,
    }
