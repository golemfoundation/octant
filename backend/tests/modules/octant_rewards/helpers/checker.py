from app.modules.dto import OctantRewardsDTO
from tests.conftest import ETH_PROCEEDS, TOTAL_ED
from tests.helpers.constants import (
    TOTAL_REWARDS,
    VANILLA_INDIVIDUAL_REWARDS,
    OPERATIONAL_COST,
    LOCKED_RATIO,
)


def check_octant_rewards(
    rewards: OctantRewardsDTO,
    ppf: int = None,
    community_fund: int = None,
    leftover: int = None,
    matched_rewards: int = None,
    total_withdrawals: int = None,
    patrons_rewards: int = None,
    donated_to_projects: int = None,
):
    assert rewards.staking_proceeds == ETH_PROCEEDS
    assert rewards.locked_ratio == LOCKED_RATIO
    assert rewards.total_effective_deposit == TOTAL_ED
    assert rewards.total_rewards == TOTAL_REWARDS
    assert rewards.vanilla_individual_rewards == VANILLA_INDIVIDUAL_REWARDS
    assert rewards.operational_cost == OPERATIONAL_COST
    assert rewards.patrons_rewards == patrons_rewards
    assert rewards.total_withdrawals == total_withdrawals
    assert rewards.matched_rewards == matched_rewards
    assert rewards.leftover == leftover
    assert rewards.community_fund == community_fund
    assert rewards.ppf == ppf
    assert rewards.donated_to_projects == donated_to_projects
