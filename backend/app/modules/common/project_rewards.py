from dataclasses import dataclass
from typing import List

from app.engine.projects import ProjectSettings
from app.engine.projects.rewards import (
    ProjectRewardsPayload,
    ProjectRewardsResult,
)
from app.modules.dto import AllocationDTO


@dataclass
class AllocationsPayload:
    before_allocations: List[AllocationDTO]
    user_new_allocations: List[AllocationDTO]


def get_projects_rewards(
    project_settings: ProjectSettings,
    allocations: AllocationsPayload,
    all_projects: List[str],
    matched_rewards: int,
) -> ProjectRewardsResult:
    return project_settings.rewards.calculate_project_rewards(
        ProjectRewardsPayload(
            before_allocations=allocations.before_allocations,
            user_new_allocations=allocations.user_new_allocations,
            matched_rewards=matched_rewards,
            projects=all_projects,
        )
    )
