from dataclasses import dataclass
from typing import Protocol, List

from app.context.manager import Context
from app.infrastructure import database
from app.modules.common import merkle_tree
from app.modules.common.project_rewards import get_projects_rewards
from app.modules.dto import FinalizedSnapshotDTO, AccountFundsDTO, OctantRewardsDTO
from app.modules.snapshots.finalized.core import calculate_leftover


class UserPatronMode(Protocol):
    def get_patrons_rewards(self, context: Context) -> int:
        ...


class OctantRewards(Protocol):
    def get_matched_rewards(self, context: Context) -> int:
        ...

    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        ...


class UserRewards(Protocol):
    def get_claimed_rewards(self, context: Context) -> (List[AccountFundsDTO], int):
        ...


@dataclass
class SimulatedFinalizedSnapshots:
    patrons_mode: UserPatronMode
    octant_rewards: OctantRewards
    user_rewards: UserRewards

    def simulate_finalized_epoch_snapshot(
        self, context: Context
    ) -> FinalizedSnapshotDTO:
        projects_settings = context.epoch_settings.project
        projects = context.projects_details.projects
        octant_rewards = self.octant_rewards.get_octant_rewards(context)
        patrons_rewards = self.patrons_mode.get_patrons_rewards(context)
        matched_rewards = self.octant_rewards.get_matched_rewards(context)
        allocations = database.allocations.get_all(context.epoch_details.epoch_num)

        projects_rewards, projects_rewards_sum, _ = get_projects_rewards(
            projects_settings,
            allocations,
            projects,
            matched_rewards,
        )
        user_rewards, user_rewards_sum = self.user_rewards.get_claimed_rewards(context)
        rewards_merkle_tree = merkle_tree.build_merkle_tree(
            user_rewards + projects_rewards
        )
        merkle_root = rewards_merkle_tree.root
        total_withdrawals = projects_rewards_sum + user_rewards_sum
        leftover = calculate_leftover(octant_rewards, total_withdrawals)

        return FinalizedSnapshotDTO(
            patrons_rewards=patrons_rewards,
            matched_rewards=matched_rewards,
            projects_rewards=projects_rewards,
            user_rewards=user_rewards,
            total_withdrawals=total_withdrawals,
            leftover=leftover,
            merkle_root=merkle_root,
        )
