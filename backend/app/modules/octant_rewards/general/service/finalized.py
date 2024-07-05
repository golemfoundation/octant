from decimal import Decimal

from app.context.manager import Context
from app.infrastructure import database
from app.modules.dto import OctantRewardsDTO
from app.pydantic import Model


class FinalizedOctantRewards(Model):
    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )

        return OctantRewardsDTO(
            staking_proceeds=int(pending_snapshot.eth_proceeds),
            locked_ratio=Decimal(pending_snapshot.locked_ratio),
            total_effective_deposit=int(pending_snapshot.total_effective_deposit),
            total_rewards=int(pending_snapshot.total_rewards),
            vanilla_individual_rewards=int(pending_snapshot.vanilla_individual_rewards),
            operational_cost=int(pending_snapshot.operational_cost),
            patrons_rewards=int(finalized_snapshot.patrons_rewards),
            matched_rewards=int(finalized_snapshot.matched_rewards),
            leftover=int(finalized_snapshot.leftover),
            total_withdrawals=int(finalized_snapshot.total_withdrawals),
            ppf=pending_snapshot.validated_ppf,
            community_fund=pending_snapshot.validated_community_fund,
        )

    def get_leverage(self, context: Context) -> float:
        allocations_sum = database.allocations.get_alloc_sum_by_epoch(
            context.epoch_details.epoch_num
        )
        finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        matched_rewards = int(finalized_snapshot.matched_rewards)

        calculate_leverage = (
            context.epoch_settings.project.rewards.leverage.calculate_leverage
        )

        return calculate_leverage(matched_rewards, allocations_sum)
