from typing import List, Tuple, Protocol, runtime_checkable

from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardDTO
from app.infrastructure import database
from app.modules.dto import AllocationDTO
from app.modules.user.allocations import core
from app.modules.user.allocations.service.saved import SavedUserAllocations


@runtime_checkable
class OctantRewards(Protocol):
    def get_matched_rewards(self, context: Context) -> int:
        ...


class PendingUserAllocations(SavedUserAllocations):
    octant_rewards: OctantRewards

    def simulate_allocation(
        self,
        context: Context,
        user_allocations: List[AllocationDTO],
        user_address: str,
    ) -> Tuple[float, int, List[ProjectRewardDTO]]:
        projects_settings = context.epoch_settings.project
        projects = context.projects_details.projects
        matched_rewards = self.octant_rewards.get_matched_rewards(context)
        all_allocations_before = database.allocations.get_all(
            context.epoch_details.epoch_num
        )

        return core.simulate_allocation(
            projects_settings,
            all_allocations_before,
            user_allocations,
            user_address,
            projects,
            matched_rewards,
        )
