from typing import List, Optional

from app import exceptions
from app.context.epoch_state import EpochState
from app.context.manager import Context
from app.engine.projects import ProjectSettings
from app.infrastructure.database.models import AllocationRequest
from app.legacy.crypto.eip712 import build_allocations_eip712_structure, recover_address
from app.modules.common.project_rewards import get_projects_rewards, AllocationsPayload
from app.modules.dto import AllocationDTO, UserAllocationRequestPayload, AllocationItem


def next_allocation_nonce(prev_allocation_request: Optional[AllocationRequest]) -> int:
    return 0 if prev_allocation_request is None else prev_allocation_request.nonce + 1


def simulate_allocation(
    projects_settings: ProjectSettings,
    allocations: AllocationsPayload,
    user_address: str,
    all_projects: List[str],
    matched_rewards: int,
):
    allocations_without_user = _replace_user_allocation(
        allocations.before_allocations, user_address
    )

    allocations = AllocationsPayload(
        before_allocations=allocations_without_user,
        user_new_allocations=allocations.user_new_allocations,
    )

    simulated_rewards = get_projects_rewards(
        projects_settings,
        allocations,
        all_projects,
        matched_rewards,
    )

    leverage = simulated_rewards.leverage

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
    _verify_user_not_a_project(user_address, context.projects_details.projects)
    _verify_allocations_not_empty(request.payload.allocations)
    _verify_no_invalid_projects(
        request.payload.allocations, context.projects_details.projects
    )
    _verify_no_duplicates(request.payload.allocations)
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
    projects_addresses = [a.project_address for a in allocations]
    invalid_projects = list(set(projects_addresses) - set(valid_projects))

    if invalid_projects:
        raise exceptions.InvalidProjects(invalid_projects)


def _verify_no_duplicates(allocations: List[AllocationItem]):
    project_addresses = [allocation.project_address for allocation in allocations]
    [project_addresses.remove(p) for p in set(project_addresses)]

    if project_addresses:
        raise exceptions.DuplicatedProjects(project_addresses)


def _verify_user_not_a_project(user_address: str, projects: List[str]):
    if user_address in projects:
        raise exceptions.ProjectAllocationToSelf


def _verify_allocations_within_budget(allocations: List[AllocationItem], budget: int):
    projects_sum = sum([a.amount for a in allocations])

    if projects_sum > budget:
        raise exceptions.RewardsBudgetExceeded


def _replace_user_allocation(
    all_allocations_before: List[AllocationDTO],
    user_address: str,
) -> List[AllocationDTO]:
    allocations_without_user = [
        alloc for alloc in all_allocations_before if alloc.user_address != user_address
    ]

    return allocations_without_user
