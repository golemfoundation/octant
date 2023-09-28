from typing import List

from app import database
from app.core.common import AccountFunds
from app.core.user.budget import get_budget


def get_claimed_rewards(epoch: int) -> (List[AccountFunds], int):
    rewards_sum = 0
    rewards = []

    for allocation in database.allocations.get_alloc_sum_by_epoch_and_user_address(
        epoch
    ):
        user_budget = get_budget(allocation.address, epoch)
        claimed_rewards = user_budget - allocation.amount
        if claimed_rewards > 0:
            rewards.append(AccountFunds(allocation.address, claimed_rewards))
            rewards_sum += claimed_rewards

    return rewards, rewards_sum
