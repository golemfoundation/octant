from dataclasses import dataclass

from app.context.context import Context
from app.modules.octant_rewards.core import calculate_rewards
from app.modules.octant_rewards.service.service import OctantRewards
from app.modules.staking.proceeds.service.service import StakingProceedsService
from app.modules.user.deposits.service.service import UserDepositsService


@dataclass
class CalculatedOctantRewards:
    staking_proceeds_service: StakingProceedsService
    user_deposits_service: UserDepositsService

    def get_octant_rewards(self, context: Context) -> OctantRewards:
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
