from datetime import datetime

from app.infrastructure.database.models import Budget, PatronModeEvent, User
from sqlalchemy import Numeric, cast, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from v2.core.types import Address
from v2.users.repositories import get_user_by_address


async def get_all_patrons_at_timestamp(
    session: AsyncSession, dt: datetime
) -> list[str]:
    """
    Get all the user addresses that at given timestamp have patron_mode_enabled=True.
    """

    results = await session.execute(
        select(PatronModeEvent.user_address)
        .filter(PatronModeEvent.created_at <= dt)
        .group_by(PatronModeEvent.user_address)
        .having(
            func.max(PatronModeEvent.created_at).filter(
                PatronModeEvent.patron_mode_enabled
            )
            == func.max(PatronModeEvent.created_at)
        )
    )

    return [row[0] for row in results.all()]


async def get_budget_sum_by_users_addresses_and_epoch(
    session: AsyncSession, users_addresses: list[str], epoch_number: int
) -> int:
    """
    Sum the budgets of given users for a given epoch.
    """
    result = await session.execute(
        select(func.sum(cast(Budget.budget, Numeric)))
        .join(User)
        .filter(User.address.in_(users_addresses), Budget.epoch == epoch_number)
    )
    total_budget = result.scalar()

    if total_budget is None:
        return 0

    return int(total_budget)


async def get_patrons_rewards(
    session: AsyncSession, finalized_timestamp: datetime, epoch_number: int
) -> int:
    """
    Patron rewards are the sum of budgets of all patrons for a given epoch.
    """

    patrons = await get_all_patrons_at_timestamp(session, finalized_timestamp)
    return await get_budget_sum_by_users_addresses_and_epoch(
        session, patrons, epoch_number
    )


async def get_budget_by_user_address_and_epoch(
    session: AsyncSession, user_address: Address, epoch: int
) -> int | None:
    """
    Get the budget of a user for a given epoch.
    """

    user = await get_user_by_address(session, user_address)
    if user is None:
        return None

    result = await session.execute(
        select(Budget.budget)
        .filter(Budget.user_id == user.id)
        .filter(Budget.epoch == epoch)
    )

    budget = result.scalar()

    if budget is None:
        return None

    return int(budget)


async def user_is_patron_with_budget(
    session: AsyncSession,
    user_address: Address,
    epoch_number: int,
    finalized_timestamp: datetime,
) -> bool:
    """
    Check if a user is a patron with a budget for a given epoch.
    """

    patrons = await get_all_patrons_at_timestamp(session, finalized_timestamp)
    if user_address not in patrons:
        return False

    budget = await get_budget_by_user_address_and_epoch(
        session, user_address, epoch_number
    )
    return budget is not None
