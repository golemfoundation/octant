from typing import Protocol, runtime_checkable

from app.context.manager import Context
from app.modules.dto import OctantRewardsDTO
from app.modules.octant_rewards.core import calculate_rewards
from app.pydantic import Model


@runtime_checkable
class StakingProceeds(Protocol):
    def get_staking_proceeds(self, context: Context) -> int:
        ...


@runtime_checkable
class EffectiveDeposits(Protocol):
    def get_total_effective_deposit(self, context: Context) -> int:
        ...


class CalculatedOctantRewards(Model):
    staking_proceeds: StakingProceeds
    effective_deposits: EffectiveDeposits

    def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        eth_proceeds = self.staking_proceeds.get_staking_proceeds(context)

        total_effective_deposit = self.effective_deposits.get_total_effective_deposit(
            context
        )
        rewards_settings = context.epoch_settings.octant_rewards
        octant_rewards = calculate_rewards(
            rewards_settings, eth_proceeds, total_effective_deposit
        )
        (
            locked_ratio,
            total_rewards,
            vanilla_individual_rewards,
            op_cost,
            ppf,
            community_fund,
        ) = (
            octant_rewards.locked_ratio,
            octant_rewards.total_rewards,
            octant_rewards.vanilla_individual_rewards,
            octant_rewards.operational_cost,
            octant_rewards.ppf_value,
            octant_rewards.community_fund,
        )

        return OctantRewardsDTO(
            staking_proceeds=eth_proceeds,
            locked_ratio=locked_ratio,
            total_effective_deposit=total_effective_deposit,
            total_rewards=total_rewards,
            vanilla_individual_rewards=vanilla_individual_rewards,
            operational_cost=op_cost,
            ppf=ppf,
            community_fund=community_fund,
        )
