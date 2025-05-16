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

    # Sum allocations by user_id
    allocations_by_user = defaultdict(int)
    for user_id, amount in allocations_result.all():
        allocations_by_user[user_id] += int(amount)

    # Calculate claimed rewards
    return {
        address: budget - allocations_by_user.get(user_id, 0)
        for user_id, (address, budget) in user_budgets.items()
        if (budget - allocations_by_user.get(user_id, 0)) > 0
    }

    # result = await session.execute(
    #     select(
    #         User.address,
    #         (
    #             cast(Budget.budget, Numeric)
    #             - func.coalesce(func.sum(cast(Allocation.amount, Numeric)), 0)
    #         ).label("claimed_rewards"),
    #     )
    #     .join(Budget, Budget.user_id == User.id)
    #     .outerjoin(
    #         Allocation,
    #         (Allocation.user_id == User.id)
    #         & (Allocation.epoch == Budget.epoch)
    #         & (Allocation.deleted_at.is_(None)),
    #     )
    #     .filter(Budget.epoch == epoch_number)
    #     .group_by(User.address, Budget.budget)
    #     .having(
    #         cast(Budget.budget, Numeric)
    #         - func.coalesce(func.sum(cast(Allocation.amount, Numeric)), 0)
    #         > 0
    #     )
    #     .order_by(User.address)
    # )

    # return {
    #     transform_to_checksum_address(addr): transform_to_biginteger(amount)
    #     for addr, amount in result.all()
    # }
