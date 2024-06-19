from collections import namedtuple
from typing import List

from app.engine.projects import ProjectSettings
from app.modules.common import merkle_tree
from app.modules.common.project_rewards import get_projects_rewards
from app.modules.dto import (
    OctantRewardsDTO,
    ProjectAccountFundsDTO,
    AllocationDTO,
    AccountFundsDTO,
)
from app.engine.projects.rewards import ProjectRewardDTO

FinalizedProjectRewards = namedtuple(
    "FinalizedProjectRewards", ["rewards", "rewards_sum"]
)


def _calculate_octant_rewards_leftover(
    octant_rewards: OctantRewardsDTO, total_withdrawals: int
) -> int:
    return (
        octant_rewards.staking_proceeds
        - octant_rewards.operational_cost
        - total_withdrawals
    )


def _calculate_matched_rewards_leftover(
    project_rewards: List[ProjectRewardDTO], total_matched_rewards: int
) -> int:
    used_matched_rewards = sum(r.matched for r in project_rewards)
    return total_matched_rewards - used_matched_rewards


def calculate_leftover(
    octant_rewards: OctantRewardsDTO,
    total_withdrawals: int,
    project_rewards: List[ProjectRewardDTO],
    matched_rewards: int,
) -> int:
    leftover = _calculate_octant_rewards_leftover(
        octant_rewards, total_withdrawals
    ) + _calculate_matched_rewards_leftover(project_rewards, matched_rewards)
    return leftover


def get_finalized_project_rewards(
    project_settings: ProjectSettings,
    allocations: List[AllocationDTO],
    all_projects: List[str],
    matched_rewards: int,
) -> FinalizedProjectRewards:
    project_rewards_result = get_projects_rewards(
        project_settings, allocations, all_projects, matched_rewards
    )

    return FinalizedProjectRewards(
        rewards=[
            ProjectAccountFundsDTO(
                address=r.address, amount=r.allocated + r.matched, matched=r.matched
            )
            for r in project_rewards_result.rewards
            if r.allocated > 0
        ],
        rewards_sum=project_rewards_result.rewards_sum,
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
