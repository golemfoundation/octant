from typing import List, Optional

from app import exceptions
from app.context.epoch_state import EpochState
from app.context.manager import Context
from app.engine.projects import ProjectSettings
from app.infrastructure.database.models import AllocationRequest
from app.legacy.crypto.eip712 import build_allocations_eip712_structure, recover_address
from app.modules.common.leverage import calculate_leverage
from app.modules.common.project_rewards import get_projects_rewards
from app.modules.dto import AllocationDTO, UserAllocationRequestPayload, AllocationItem


def next_allocation_nonce(prev_allocation_request: Optional[AllocationRequest]) -> int:
    return 0 if prev_allocation_request is None else prev_allocation_request.nonce + 1


def simulate_allocation(
    projects_settings: ProjectSettings,
    all_allocations_before: List[AllocationDTO],
    user_allocations: List[AllocationDTO],
    user_address: str,
    all_projects: List[str],
    matched_rewards: int,
):
    simulated_allocations = _replace_user_allocation(
        all_allocations_before, user_allocations, user_address
    )

    simulated_rewards = get_projects_rewards(
        projects_settings,
        simulated_allocations,
        all_projects,
        matched_rewards,
    )

    leverage = calculate_leverage(matched_rewards, simulated_rewards.total_allocated)

    return (
        leverage,
        simulated_rewards.threshold,
        sorted(simulated_rewards.rewards, key=lambda r: r.address),
    )


def recover_user_address(request: UserAllocationRequestPayload) -> str:
    eip712_data = build_allocations_eip712_structure(request.payload)
    return recover_address(eip712_data, request.signature)


def verify_user_allocation_request(
    context: Context,
    request: UserAllocationRequestPayload,
    user_address: str,
    expected_nonce: int,
    user_budget: int,
    patrons: List[str],
):
    _verify_epoch_state(context.epoch_state)
    _verify_nonce(request.payload.nonce, expected_nonce)
    _verify_user_not_a_patron(user_address, patrons)
    _verify_allocations_not_empty(request.payload.allocations)
    _verify_no_invalid_projects(
        request.payload.allocations, valid_projects=context.projects_details.projects
    )
    _verify_no_duplicates(request.payload.allocations)
    _verify_no_self_allocation(request.payload.allocations, user_address)
    _verify_allocations_within_budget(request.payload.allocations, user_budget)


def _verify_epoch_state(epoch_state: EpochState):
    if epoch_state is EpochState.PRE_PENDING:
        raise exceptions.MissingSnapshot

    if epoch_state is not EpochState.PENDING:
        raise exceptions.NotInDecisionWindow


def _verify_nonce(nonce: int, expected_nonce: int):
    # if expected_nonce is not None and request.payload.nonce != expected_nonce:
    if nonce != expected_nonce:
        raise exceptions.WrongAllocationsNonce(nonce, expected_nonce)


def _verify_user_not_a_patron(user_address: str, patrons: List[str]):
    if user_address in patrons:
        raise exceptions.NotAllowedInPatronMode(user_address)


def _verify_allocations_not_empty(allocations: List[AllocationItem]):
    if len(allocations) == 0:
        raise exceptions.EmptyAllocations()


def _verify_no_invalid_projects(
    allocations: List[AllocationItem], valid_projects: List[str]
):
    projects_addresses = [a.proposal_address for a in allocations]
    invalid_projects = list(set(projects_addresses) - set(valid_projects))

    if invalid_projects:
        raise exceptions.InvalidProjects(invalid_projects)


def _verify_no_duplicates(allocations: List[AllocationItem]):
    proposal_addresses = [allocation.proposal_address for allocation in allocations]
    [proposal_addresses.remove(p) for p in set(proposal_addresses)]

    if proposal_addresses:
        raise exceptions.DuplicatedProposals(proposal_addresses)


def _verify_no_self_allocation(allocations: List[AllocationItem], user_address: str):
    for allocation in allocations:
        if allocation.proposal_address == user_address:
            raise exceptions.ProjectAllocationToSelf


def _verify_allocations_within_budget(allocations: List[AllocationItem], budget: int):
    proposals_sum = sum([a.amount for a in allocations])

    if proposals_sum > budget:
        raise exceptions.RewardsBudgetExceeded


def _replace_user_allocation(
    all_allocations_before: List[AllocationDTO],
    user_allocations: List[AllocationDTO],
    user_address: str,
) -> List[AllocationDTO]:
    allocations_without_user = [
        alloc for alloc in all_allocations_before if alloc.user_address != user_address
    ]
    allocations_after_replacement = allocations_without_user + user_allocations

    return allocations_after_replacement
