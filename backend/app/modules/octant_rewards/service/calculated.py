from dataclasses import dataclass
from typing import Protocol

from app.context.manager import Context
from app.modules.dto import OctantRewardsDTO
from app.modules.octant_rewards.core import calculate_rewards


class StakingProceeds(Protocol):
    def get_staking_proceeds(self, context: Context) -> int:
        ...


class EffectiveDeposits(Protocol):
    def get_total_effective_deposit(self, context: Context) -> int:
        ...


@dataclass
class CalculatedOctantRewards:
    staking_proceeds: StakingProceeds
    effective_deposits: EffectiveDeposits

    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        eth_proceeds = self.staking_proceeds.get_staking_proceeds(context)
        total_effective_deposit = self.effective_deposits.get_total_effective_deposit(
            context
        )
        rewards_settings = context.epoch_settings.octant_rewards
        (
            locked_ratio,
            total_rewards,
            all_individual_rewards,
            op_cost,
        ) = calculate_rewards(rewards_settings, eth_proceeds, total_effective_deposit)

        return OctantRewardsDTO(
            staking_proceeds=eth_proceeds,
            locked_ratio=locked_ratio,
            total_effective_deposit=total_effective_deposit,
            total_rewards=total_rewards,
            individual_rewards=all_individual_rewards,
            operational_cost=op_cost,
        )
