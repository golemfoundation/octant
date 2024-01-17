from dataclasses import dataclass
from typing import List, Tuple, Protocol

from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardDTO
from app.infrastructure import database
from app.modules.dto import AllocationDTO
from app.modules.user.allocations import core


class OctantRewards(Protocol):
    def get_matched_rewards(self, context: Context) -> int:
        ...


@dataclass
class PendingUserAllocations:
    octant_rewards: OctantRewards

    def get_all_donors_addresses(self, context: Context) -> List[str]:
        return database.allocations.get_users_with_allocations(
            context.epoch_details.epoch_num
        )

    def simulate_allocation(
        self,
        context: Context,
        user_allocations: List[AllocationDTO],
        user_address: str,
    ) -> Tuple[float, List[ProjectRewardDTO]]:
        projects_settings = context.epoch_settings.project
        projects = context.projects_details.projects
        matched_rewards = self.octant_rewards.get_matched_rewards(context)
        all_allocations_db = database.allocations.get_all_by_epoch(
            context.epoch_details.epoch_num
        )
        all_allocations_before = [
            AllocationDTO(
                amount=int(a.amount),
                proposal_address=a.proposal_address,
                user_address=a.user.address,
            )
            for a in all_allocations_db
        ]

        return core.simulate_allocation(
            projects_settings,
            all_allocations_before,
            user_allocations,
            user_address,
            projects,
            matched_rewards,
        )
