from dataclasses import dataclass
from decimal import Decimal

from app.engine.octant_rewards import OctantRewardsSettings
from app.engine.octant_rewards.community_fund import CommunityFundPayload
from app.engine.octant_rewards.locked_ratio import LockedRatioPayload
from app.engine.octant_rewards.operational_cost import OperationalCostPayload
from app.engine.octant_rewards.ppf import PPFPayload
from app.engine.octant_rewards.total_and_individual import TotalAndAllIndividualPayload


@dataclass
class OctantRewardsWrapper:
    locked_ratio: Decimal
    total_rewards: int
    vanilla_individual_rewards: int
    operational_cost: int
    ppf_value: int | None
    community_fund: int | None


def calculate_rewards(
    octant_rewards_settings: OctantRewardsSettings,
    eth_proceeds: int,
    total_effective_deposit: int,
) -> OctantRewardsWrapper:
    locked_ratio_calculator = octant_rewards_settings.locked_ratio
    op_cost_calculator = octant_rewards_settings.operational_cost
    rewards_calculator = octant_rewards_settings.total_and_vanilla_individual_rewards

    locked_ratio = locked_ratio_calculator.calculate_locked_ratio(
        LockedRatioPayload(total_effective_deposit)
    )
    operational_cost = op_cost_calculator.calculate_operational_cost(
        OperationalCostPayload(eth_proceeds)
    )
    rewards_payload = TotalAndAllIndividualPayload(
        eth_proceeds, locked_ratio, operational_cost
    )
    total_rewards = rewards_calculator.calculate_total_rewards(rewards_payload)
    vanilla_individual_rewards = (
        rewards_calculator.calculate_vanilla_individual_rewards(rewards_payload)
    )
    individual_rewards_equilibrium = (
        rewards_calculator.calculate_individual_rewards_equilibrium(rewards_payload)
    )

    ppf_calculator = octant_rewards_settings.ppf
    ppf_payload = PPFPayload(
        individual_rewards_equilibrium,
        vanilla_individual_rewards,
        locked_ratio,
        rewards_calculator.IRE_PERCENT,
    )
    ppf_value = ppf_calculator.calculate_ppf(ppf_payload)

    cf_calculator = octant_rewards_settings.community_fund
    cf_payload = CommunityFundPayload(eth_proceeds)
    cf_value = cf_calculator.calculate_cf(cf_payload)

    return OctantRewardsWrapper(
        locked_ratio=locked_ratio,
        total_rewards=total_rewards,
        vanilla_individual_rewards=vanilla_individual_rewards,
        operational_cost=operational_cost,
        ppf_value=ppf_value,
        community_fund=cf_value,
    )
