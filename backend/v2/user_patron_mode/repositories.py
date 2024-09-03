from datetime import datetime
from typing import List

from app.infrastructure.database.models import Budget, PatronModeEvent, User
from sqlalchemy import Integer, cast, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import aliased
from v2.users.repositories import get_user_by_address


async def get_all_patrons_at_timestamp(
    session: AsyncSession, dt: datetime
) -> List[str]:
    """
    From PatronModeEvent table, get all the user addresses that have patron_mode_enabled=True at a given timestamp.
    """

    subquery = (
        select(
            PatronModeEvent.user_address,
            PatronModeEvent.patron_mode_enabled,
            PatronModeEvent.created_at,
        )
        .filter(PatronModeEvent.created_at <= dt)
        .order_by(PatronModeEvent.user_address, PatronModeEvent.created_at.desc())
        .subquery()
    )

    alias = aliased(PatronModeEvent, subquery)

    result = await session.execute(
        select(alias.user_address)
        .filter(alias.patron_mode_enabled)
        .group_by(alias.user_address)
    )

    patrons = [row[0] for row in result.fetchall()]
    return patrons


async def get_budget_sum_by_users_addresses_and_epoch(
    session: AsyncSession, users_addresses: List[str], epoch_number: int
) -> int:
    """
    Sum the budgets of given users for a given epoch.
    """
    result = await session.execute(
        select(func.sum(cast(Budget.budget, Integer)))
        .join(User)
        .filter(User.address.in_(users_addresses), Budget.epoch == epoch_number)
    )
    total_budget = result.scalar()

    if total_budget is None:
        return 0

    return total_budget


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
    session: AsyncSession, user_address: str, epoch: int
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
    user_address: str,
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
