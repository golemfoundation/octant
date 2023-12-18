from dataclasses import dataclass
from decimal import Decimal

from app.v2.engine.octant_rewards import OctantRewardsSettings
from app.v2.engine.octant_rewards.locked_ratio import LockedRatioPayload
from app.v2.engine.octant_rewards.total_and_individual import (
    TotalAndAllIndividualPayload,
)


@dataclass
class OctantRewardsDTO:
    eth_proceeds: int
    locked_ratio: Decimal
    total_rewards: int
    all_individual_rewards: int


@dataclass
class OctantRewardsCalculator:
    def calculate_rewards(
        self,
        octant_rewards_settings: OctantRewardsSettings,
        eth_proceeds: int,
        total_effective_deposit: int,
    ) -> OctantRewardsDTO:
        locked_ratio_calculator = octant_rewards_settings.locked_ratio
        rewards_calculator = octant_rewards_settings.total_and_all_individual_rewards

        locked_ratio = locked_ratio_calculator.calculate_locked_ratio(
            LockedRatioPayload(total_effective_deposit)
        )
        rewards_payload = TotalAndAllIndividualPayload(eth_proceeds, locked_ratio)
        total_rewards = rewards_calculator.calculate_total_rewards(rewards_payload)
        all_individual_rewards = rewards_calculator.calculate_all_individual_rewards(
            rewards_payload
        )

        return OctantRewardsDTO(
            eth_proceeds=eth_proceeds,
            locked_ratio=locked_ratio,
            total_rewards=total_rewards,
            all_individual_rewards=all_individual_rewards,
        )
