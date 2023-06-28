from decimal import Decimal
from typing import List

from app import database
from app.core.common import AddressAndAmount


def get_budget(user_address: str, epoch: int) -> int:
    snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None:
        return 0

    individual_share = Decimal(deposit.effective_deposit) / Decimal(
        snapshot.total_effective_deposit
    )

    return int(Decimal(snapshot.all_individual_rewards) * individual_share)


def get_claimed_rewards(epoch: int) -> (List[AddressAndAmount], int):
    rewards_sum = 0
    rewards = []

    for (
        user_addr,
        allocated,
    ) in database.allocations.get_alloc_sum_by_epoch_and_user_address(epoch):
        user_budget = get_budget(user_addr, epoch)
        claimed_rewards = user_budget - allocated
        if claimed_rewards > 0:
            rewards.append(AddressAndAmount(user_addr, claimed_rewards))
            rewards_sum += claimed_rewards

    return rewards, rewards_sum
