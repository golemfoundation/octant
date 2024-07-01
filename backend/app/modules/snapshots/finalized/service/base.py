from typing import Protocol, List, runtime_checkable

from app.context.manager import Context
from app.infrastructure import database
from app.modules.dto import (
    FinalizedSnapshotDTO,
    AccountFundsDTO,
    OctantRewardsDTO,
    AllocationDTO,
)
from app.modules.snapshots.finalized.core import (
    calculate_leftover,
    get_merkle_root,
    get_total_withdrawals,
    FinalizedProjectRewards,
)
from app.pydantic import Model


@runtime_checkable
class UserPatronMode(Protocol):
    def get_patrons_rewards(self, context: Context) -> int:
        ...


@runtime_checkable
class OctantRewards(Protocol):
    def get_matched_rewards(self, context: Context) -> int:
        ...

    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        ...


@runtime_checkable
class UserRewards(Protocol):
    def get_claimed_rewards(self, context: Context) -> (List[AccountFundsDTO], int):
        ...


@runtime_checkable
class ProjectRewards(Protocol):
    def get_finalized_project_rewards(
        self,
        context: Context,
        allocations: List[AllocationDTO],
        all_projects: List[str],
        matched_rewards: int,
    ) -> FinalizedProjectRewards:
        ...


class BaseFinalizedSnapshots(Model):
    patrons_mode: UserPatronMode
    octant_rewards: OctantRewards
    user_rewards: UserRewards
    project_rewards: ProjectRewards

    def _calculate_finalized_epoch_snapshot(
        self, context: Context
    ) -> FinalizedSnapshotDTO:
        octant_rewards_settings = context.epoch_settings.octant_rewards
        projects = context.projects_details.projects
        octant_rewards = self.octant_rewards.get_octant_rewards(context)
        patrons_rewards = self.patrons_mode.get_patrons_rewards(context)
        matched_rewards = self.octant_rewards.get_matched_rewards(context)

        allocations = database.allocations.get_all_with_uqs(
            context.epoch_details.epoch_num
        )

        user_rewards, user_rewards_sum = self.user_rewards.get_claimed_rewards(context)
        project_rewards = self.project_rewards.get_finalized_project_rewards(
            context,
            allocations,
            projects,
            matched_rewards,
        )

        merkle_root = get_merkle_root(user_rewards, project_rewards.rewards)
        total_withdrawals = get_total_withdrawals(
            user_rewards_sum, project_rewards.rewards_sum
        )

        used_matched_rewards = sum(r.matched for r in project_rewards.rewards)
        leftover = calculate_leftover(
            octant_rewards_settings,
            octant_rewards,
            total_withdrawals,
            matched_rewards,
            used_matched_rewards,
        )

        return FinalizedSnapshotDTO(
            patrons_rewards=patrons_rewards,
            matched_rewards=matched_rewards,
            projects_rewards=project_rewards.rewards,
            user_rewards=user_rewards,
            total_withdrawals=total_withdrawals,
            leftover=leftover,
            merkle_root=merkle_root,
        )
