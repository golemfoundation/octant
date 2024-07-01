from typing import Protocol, runtime_checkable

from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardsResult
from app.infrastructure import database
from app.modules.common.project_rewards import get_projects_rewards
from app.modules.projects.rewards.service.saved import SavedProjectRewards
from app.pydantic import Model


@runtime_checkable
class OctantRewards(Protocol):
    def get_matched_rewards(self, context: Context) -> int:
        ...


class EstimatedProjectRewards(SavedProjectRewards, Model):
    octant_rewards: OctantRewards

    def get_project_rewards(self, context: Context) -> ProjectRewardsResult:
        project_settings = context.epoch_settings.project
        all_projects = context.projects_details.projects
        matched_rewards = self.octant_rewards.get_matched_rewards(context)
        allocations = database.allocations.get_all_with_uqs(
            context.epoch_details.epoch_num
        )

        projects_rewards = get_projects_rewards(
            project_settings,
            allocations,
            all_projects,
            matched_rewards,
        )

        return projects_rewards
