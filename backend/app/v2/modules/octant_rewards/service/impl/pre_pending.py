from dataclasses import dataclass

from app.v2.context.context import EpochContext
from app.v2.modules.octant_rewards.api import OctantRewards
from app.v2.modules.octant_rewards.core import calculate_rewards
from app.v2.modules.octant_rewards.service.impl.default import (
    DefaultOctantRewardsService,
)


@dataclass
class PrePendingOctantRewardsService(DefaultOctantRewardsService):
    def get_octant_rewards(self, context: EpochContext) -> OctantRewards:
        eth_proceeds = self.staking_proceeds_service.get_staking_proceeds(context)
        total_effective_deposit = (
            self.user_deposits_service.get_total_effective_deposit(context)
        )
        rewards_settings = context.epoch_settings.octant_rewards
        locked_ratio, total_rewards, all_individual_rewards = calculate_rewards(
            rewards_settings, eth_proceeds, total_effective_deposit
        )

        return OctantRewards(
            eth_proceeds=eth_proceeds,
            locked_ratio=locked_ratio,
            total_effective_deposit=total_effective_deposit,
            total_rewards=total_rewards,
            individual_rewards=all_individual_rewards,
        )
