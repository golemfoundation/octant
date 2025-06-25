from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models import (
    User,
    Budget,
    Allocation,
)
from sqlalchemy import select
from v2.core.transformers import transform_to_checksum_address
from v2.allocations.repositories import (
    get_user_allocations_sum_by_epoch,
    has_allocation_requests,
)
from v2.user_patron_mode.repositories import get_budget_by_user_address_and_epoch
from v2.core.types import Address
from collections import defaultdict


async def get_user_claimed_rewards(
    session: AsyncSession, user_address: Address, epoch_number: int
) -> int:
    """
    Returns the amount of claimed rewards for a given user and epoch.
    """

    has_allocations = await has_allocation_requests(session, user_address, epoch_number)
    if not has_allocations:
        return 0

    # If user has allocated rewards we need to subtract the allocations from the budget
    allocations_sum = await get_user_allocations_sum_by_epoch(
        session, user_address, epoch_number
    )
    budget = await get_budget_by_user_address_and_epoch(
        session, user_address, epoch_number
    )

    return budget - allocations_sum


async def get_all_users_claimed_rewards(
    session: AsyncSession, epoch_number: int
) -> dict[Address, int]:
    """
    Returns a dictionary of all users and their claimed rewards for a given epoch.
    Only users with claimed rewards are included in the dictionary (sum(allocations) < budget).
    Claimed rewards are calculated as the difference between the user's budget and the sum of their allocations for the epoch.
    User needs to make an allocation request to claim rewards, if they did not allocate anythin, it means they claimed nothing.
    """

    # Fetch all user addresses and budgets for the epoch
    budgets_result = await session.execute(
        select(User.id, User.address, Budget.budget)
        .join(Budget, Budget.user_id == User.id)
        .filter(Budget.epoch == epoch_number)
    )
    user_budgets = {
        user_id: (transform_to_checksum_address(address), int(budget))
        for user_id, address, budget in budgets_result.all()
    }

    # Fetch all allocations for the epoch (as strings), not summed
    allocations_result = await session.execute(
        select(Allocation.user_id, Allocation.amount)
        .filter(Allocation.epoch == epoch_number)
        .filter(Allocation.deleted_at.is_(None))
    )

    # Sum allocations by user_id (we do it in python to avoid floating point issues)
    allocations_by_user = defaultdict(int)
    for user_id, amount in allocations_result.all():
        allocations_by_user[user_id] += int(amount)

    # Calculate claimed rewards
    claimed_rewards = {}
    for user_id, allocation_sum in allocations_by_user.items():
        # if this fails it means that someone made allocation without having a budget
        address, budget = user_budgets[user_id]

        claimed = budget - allocation_sum
        if claimed > 0:
            claimed_rewards[address] = claimed

    return claimed_rewards
