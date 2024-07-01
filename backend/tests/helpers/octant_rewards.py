from app.modules.dto import OctantRewardsDTO
from tests.helpers.constants import (
    ETH_PROCEEDS,
    TOTAL_ED,
    TOTAL_REWARDS,
    VANILLA_INDIVIDUAL_REWARDS,
    LOCKED_RATIO,
    OPERATIONAL_COST,
    PPF,
    COMMUNITY_FUND,
)


def octant_rewards(
    staking_proceeds=ETH_PROCEEDS,
    total_effective_deposit=TOTAL_ED,
    total_rewards=TOTAL_REWARDS,
    individual_rewards=VANILLA_INDIVIDUAL_REWARDS,
    locked_ratio=LOCKED_RATIO,
    operational_cost=OPERATIONAL_COST,
    ppf=PPF,
    community_fund=COMMUNITY_FUND,
):
    return OctantRewardsDTO(
        staking_proceeds=staking_proceeds,
        total_effective_deposit=total_effective_deposit,
        total_rewards=total_rewards,
        vanilla_individual_rewards=individual_rewards,
        locked_ratio=locked_ratio,
        operational_cost=operational_cost,
        ppf=ppf,
        community_fund=community_fund,
    )
