from sqlalchemy.ext.asyncio import AsyncSession

from v2.allocations.repositories import (
    get_user_allocations_sum_by_epoch,
    has_allocation_requests,
)
from v2.user_patron_mode.repositories import get_budget_by_user_address_and_epoch
from v2.core.types import Address


async def get_user_claimed_rewards(
    session: AsyncSession, user_address: Address, epoch_number: int
) -> int:
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
