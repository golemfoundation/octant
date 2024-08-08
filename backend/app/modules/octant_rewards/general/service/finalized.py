from decimal import Decimal

from app.context.manager import Context
from app.infrastructure import database
from app.modules.dto import OctantRewardsDTO
from app.pydantic import Model
from app.engine.octant_rewards.leftover import LeftoverPayload


class FinalizedOctantRewards(Model):
    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )

        leftover_payload = LeftoverPayload(
            staking_proceeds=int(pending_snapshot.eth_proceeds),
            operational_cost=int(pending_snapshot.operational_cost),
            community_fund=pending_snapshot.validated_community_fund,
            ppf=pending_snapshot.validated_ppf,
            total_withdrawals=int(finalized_snapshot.total_withdrawals),
        )

        unused_matched_rewards = context.epoch_settings.octant_rewards.leftover.extract_unused_matched_rewards(
            int(finalized_snapshot.leftover), leftover_payload
        )

        allocations_sum = database.allocations.get_alloc_sum_by_epoch(
            context.epoch_details.epoch_num
        )
        donated_to_projects = (
            int(finalized_snapshot.matched_rewards)
            - unused_matched_rewards
            + allocations_sum
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
            donated_to_projects=donated_to_projects,
        )

    def get_leverage(self, context: Context) -> float:
        allocations_sum = database.allocations.get_alloc_sum_by_epoch(
            context.epoch_details.epoch_num
        )
        finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        matched_rewards = int(finalized_snapshot.matched_rewards)

        return context.epoch_settings.project.rewards.leverage.calculate_leverage(
            matched_rewards, allocations_sum
        )
