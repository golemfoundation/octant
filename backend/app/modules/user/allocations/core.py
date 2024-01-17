from typing import List

from app.engine.projects import ProjectSettings
from app.engine.projects.rewards import ProjectRewardsPayload, ProjectRewardDTO
from app.modules.common.leverage import calculate_leverage
from app.modules.dto import AllocationDTO


def simulate_allocation(
    projects_settings: ProjectSettings,
    all_allocations_before: List[AllocationDTO],
    user_allocations: List[AllocationDTO],
    user_address: str,
    all_projects: List[str],
    matched_rewards: int,
):
    project_rewards_before, _ = _estimate_projects_rewards(
        projects_settings,
        all_allocations_before,
        all_projects,
        matched_rewards,
    )

    all_allocations_after = _replace_user_allocation(
        all_allocations_before, user_allocations, user_address
    )

    project_rewards_after, total_allocated = _estimate_projects_rewards(
        projects_settings,
        all_allocations_after,
        all_projects,
        matched_rewards,
    )

    leverage = calculate_leverage(matched_rewards, total_allocated)
    rewards_diff = [
        ProjectRewardDTO(
            base.address,
            simulated.allocated,
            simulated.matched - base.matched,
        )
        for base, simulated in zip(project_rewards_before, project_rewards_after)
    ]

    return leverage, rewards_diff


def _estimate_projects_rewards(
    project_settings: ProjectSettings,
    allocations: List[AllocationDTO],
    all_projects: List[str],
    matched_rewards: int,
) -> (List[ProjectRewardDTO], int):
    (
        project_rewards,
        _,
        total_allocated,
    ) = project_settings.rewards.calculate_project_rewards(
        ProjectRewardsPayload(
            allocations=allocations,
            matched_rewards=matched_rewards,
            projects=all_projects,
        )
    )
    return sorted(project_rewards, key=lambda r: r.address), total_allocated


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
