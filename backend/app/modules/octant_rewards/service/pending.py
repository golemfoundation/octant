from decimal import Decimal
from typing import Protocol, runtime_checkable

from app.context.manager import Context
from app.engine.octant_rewards.matched import MatchedRewardsPayload
from app.infrastructure import database
from app.modules.common.leverage import calculate_leverage
from app.modules.dto import OctantRewardsDTO
from app.pydantic import Model
from app.engine.octant_rewards.ppf import PPFPayload


@runtime_checkable
class UserPatronMode(Protocol):
    def get_patrons_rewards(self, context: Context) -> int:
        ...


class PendingOctantRewards(Model):
    patrons_mode: UserPatronMode

    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        return OctantRewardsDTO(
            staking_proceeds=int(pending_snapshot.eth_proceeds),
            locked_ratio=Decimal(pending_snapshot.locked_ratio),
            total_effective_deposit=int(pending_snapshot.total_effective_deposit),
            total_rewards=int(pending_snapshot.total_rewards),
            individual_rewards=int(pending_snapshot.all_individual_rewards),
            operational_cost=int(pending_snapshot.operational_cost),
            community_fund=pending_snapshot.validated_community_fund,
            ppf=pending_snapshot.validated_ppf,
        )

    def get_matched_rewards(self, context: Context) -> int:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        patrons_rewards = self.patrons_mode.get_patrons_rewards(context)
        matched_rewards_settings = context.epoch_settings.octant_rewards.matched_rewards
        ppf_rewards_settings = context.epoch_settings.octant_rewards.ppf
        ppf_value = ppf_rewards_settings.calculate_ppf(
            PPFPayload(int(pending_snapshot.eth_proceeds))
        )

        return matched_rewards_settings.calculate_matched_rewards(
            MatchedRewardsPayload(
                total_rewards=int(pending_snapshot.total_rewards),
                all_individual_rewards=int(pending_snapshot.all_individual_rewards),
                patrons_rewards=patrons_rewards,
                ppf=ppf_value,
            )
        )

    def get_leverage(self, context: Context) -> float:
        allocations_sum = database.allocations.get_alloc_sum_by_epoch(
            context.epoch_details.epoch_num
        )
        matched_rewards = self.get_matched_rewards(context)

        return calculate_leverage(matched_rewards, allocations_sum)
