from typing import List

from app.engine.projects import ProjectSettings
from app.engine.projects.rewards import ProjectRewardDTO, ProjectRewardsPayload
from app.modules.dto import AllocationDTO


def get_projects_rewards(
    project_settings: ProjectSettings,
    allocations: List[AllocationDTO],
    all_projects: List[str],
    matched_rewards: int,
) -> (List[ProjectRewardDTO], int, int, int):
    return project_settings.rewards.calculate_project_rewards(
        ProjectRewardsPayload(
            allocations=allocations,
            matched_rewards=matched_rewards,
            projects=all_projects,
        )
    )
