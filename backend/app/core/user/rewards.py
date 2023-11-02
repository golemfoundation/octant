from typing import List

from app import database
from app.core.allocations import has_user_allocated_rewards
from app.core.common import AccountFunds
from app.core.user.budget import get_budget


def get_all_claimed_rewards(epoch: int) -> (List[AccountFunds], int):
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


def get_user_claimed_rewards(address: str, epoch: int) -> int:
    if not has_user_allocated_rewards(address, epoch):
        return 0

    user_allocation = database.allocations.get_all_by_user_addr_and_epoch(
        address, epoch
    )
    user_budget = get_budget(address, epoch)
    allocation_sum = sum([int(a.amount) for a in user_allocation])

    return user_budget - allocation_sum
