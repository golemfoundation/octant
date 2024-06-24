from decimal import Decimal
from typing import Protocol, runtime_checkable, List

from app.context.manager import Context
from app.engine.octant_rewards.leftover import LeftoverPayload
from app.infrastructure import database
from app.infrastructure.database.models import PendingEpochSnapshot
from app.modules.common.leverage import calculate_leverage
from app.modules.dto import OctantRewardsDTO, AccountFundsDTO, AllocationDTO
from app.modules.snapshots.finalized.core import FinalizedProjectRewards
from app.pydantic import Model


@runtime_checkable
class UserPatronMode(Protocol):
    def get_patrons_rewards(self, context: Context) -> int:
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
        allocations: list[AllocationDTO],
        all_projects: list[str],
        matched_rewards: int,
    ) -> FinalizedProjectRewards:
        ...


@runtime_checkable
class OctantMatchedRewards(Protocol):
    def get_matched_rewards(self, context: Context) -> int:
        ...


class PendingOctantRewards(Model):
    patrons_mode: UserPatronMode
    user_rewards: UserRewards
    project_rewards: ProjectRewards
    octant_matched_rewards: OctantMatchedRewards

    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        matched_rewards = self.octant_matched_rewards.get_matched_rewards(context)

        return OctantRewardsDTO(
            staking_proceeds=int(pending_snapshot.eth_proceeds),
            locked_ratio=Decimal(pending_snapshot.locked_ratio),
            total_effective_deposit=int(pending_snapshot.total_effective_deposit),
            total_rewards=int(pending_snapshot.total_rewards),
            vanilla_individual_rewards=int(pending_snapshot.vanilla_individual_rewards),
            operational_cost=int(pending_snapshot.operational_cost),
            community_fund=pending_snapshot.validated_community_fund,
            ppf=pending_snapshot.validated_ppf,
            matched_rewards=matched_rewards,
            patrons_rewards=self.patrons_mode.get_patrons_rewards(context),
            leftover=self.get_leftover(context, pending_snapshot, matched_rewards),
        )

    def get_matched_rewards(self, context: Context) -> int:
        return self.octant_matched_rewards.get_matched_rewards(context)

    def get_leverage(self, context: Context) -> float:
        allocations_sum = database.allocations.get_alloc_sum_by_epoch(
            context.epoch_details.epoch_num
        )
        matched_rewards = self.get_matched_rewards(context)

        return calculate_leverage(matched_rewards, allocations_sum)

    def get_leftover(
        self,
        context: Context,
        pending_snapshot: PendingEpochSnapshot,
        matched_rewards: int,
    ) -> int:
        allocations = database.allocations.get_all(context.epoch_details.epoch_num)
        _, user_rewards = self.user_rewards.get_claimed_rewards(context)
        project_rewards = self.project_rewards.get_finalized_project_rewards(
            context, allocations, context.projects_details.projects, matched_rewards
        )

        return context.epoch_settings.octant_rewards.leftover.calculate_leftover(
            LeftoverPayload(
                staking_proceeds=int(pending_snapshot.eth_proceeds),
                operational_cost=int(pending_snapshot.operational_cost),
                community_fund=int(pending_snapshot.community_fund)
                if pending_snapshot.community_fund
                else None,
                ppf=pending_snapshot.validated_ppf,
                total_withdrawals=user_rewards + project_rewards.rewards_sum,
                total_matched_rewards=matched_rewards,
                used_matched_rewards=sum(r.matched for r in project_rewards.rewards),
            )
        )
