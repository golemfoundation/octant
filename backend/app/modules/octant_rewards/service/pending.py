from decimal import Decimal
from typing import Protocol, runtime_checkable, List

from app.context.manager import Context
from app.engine.octant_rewards.leftover import LeftoverPayload
from app.engine.octant_rewards.matched import MatchedRewardsPayload
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


class PendingOctantRewards(Model):
    patrons_mode: UserPatronMode
    user_rewards: UserRewards
    project_rewards: ProjectRewards

    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        matched_rewards = self.get_matched_rewards(context)

        return OctantRewardsDTO(
            staking_proceeds=int(pending_snapshot.eth_proceeds),
            locked_ratio=Decimal(pending_snapshot.locked_ratio),
            total_effective_deposit=int(pending_snapshot.total_effective_deposit),
            total_rewards=int(pending_snapshot.total_rewards),
            individual_rewards=int(pending_snapshot.all_individual_rewards),
            operational_cost=int(pending_snapshot.operational_cost),
            community_fund=pending_snapshot.validated_community_fund,
            ppf=pending_snapshot.validated_ppf,
            matched_rewards=matched_rewards,
            patrons_rewards=self.patrons_mode.get_patrons_rewards(context),
            leftover=self.get_leftover(context, pending_snapshot, matched_rewards),
        )

    def get_matched_rewards(self, context: Context) -> int:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        patrons_rewards = self.patrons_mode.get_patrons_rewards(context)
        matched_rewards_settings = context.epoch_settings.octant_rewards.matched_rewards

        return matched_rewards_settings.calculate_matched_rewards(
            MatchedRewardsPayload(
                total_rewards=int(pending_snapshot.total_rewards),
                all_individual_rewards=int(pending_snapshot.all_individual_rewards),
                patrons_rewards=patrons_rewards,
                staking_proceeds=int(pending_snapshot.eth_proceeds),
                locked_ratio=Decimal(pending_snapshot.locked_ratio),
                ire_percent=context.epoch_settings.octant_rewards.total_and_all_individual_rewards.IRE_PERCENT,
                tr_percent=context.epoch_settings.octant_rewards.total_and_all_individual_rewards.TR_PERCENT,
            )
        )

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
                staking_proceeds=pending_snapshot.eth_proceeds,
                operational_cost=pending_snapshot.operational_cost,
                community_fund=pending_snapshot.community_fund,
                ppf=pending_snapshot.ppf,
                total_withdrawals=user_rewards + project_rewards.rewards,
            )
        )
