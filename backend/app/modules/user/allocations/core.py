from typing import List

from app.engine.projects import ProjectSettings
from app.modules.common.leverage import calculate_leverage
from app.modules.common.project_rewards import get_projects_rewards
from app.modules.dto import AllocationDTO


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
