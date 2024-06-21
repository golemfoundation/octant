from collections import namedtuple
from typing import List

from app.engine.octant_rewards import OctantRewardsSettings
from app.engine.octant_rewards.leftover import LeftoverPayload
from app.modules.common import merkle_tree
from app.modules.dto import (
    OctantRewardsDTO,
    ProjectAccountFundsDTO,
    AccountFundsDTO,
)

FinalizedProjectRewards = namedtuple(
    "FinalizedProjectRewards", ["rewards", "rewards_sum"]
)


def calculate_leftover(
    octant_rewards_settings: OctantRewardsSettings,
    octant_rewards: OctantRewardsDTO,
    total_withdrawals: int,
    total_matched_rewards: int,
    used_matched_rewards: int,
) -> int:
    return octant_rewards_settings.leftover.calculate_leftover(
        LeftoverPayload(
            staking_proceeds=octant_rewards.staking_proceeds,
            operational_cost=octant_rewards.operational_cost,
            community_fund=octant_rewards.community_fund,
            ppf=octant_rewards.ppf,
            total_withdrawals=total_withdrawals,
            total_matched_rewards=total_matched_rewards,
            used_matched_rewards=used_matched_rewards,
        )
    )


def get_merkle_root(
    user_rewards: List[AccountFundsDTO], projects_rewards: List[ProjectAccountFundsDTO]
):
    rewards = user_rewards + projects_rewards
    if not rewards:
        return None

    rewards_merkle_tree = merkle_tree.build_merkle_tree(rewards)
    return rewards_merkle_tree.root


def get_total_withdrawals(user_rewards_sum: int, projects_rewards_sum: int):
    return user_rewards_sum + projects_rewards_sum
