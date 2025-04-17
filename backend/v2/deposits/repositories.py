from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import Deposit, User
from v2.core.types import Address
from v2.core.transformers import transform_to_checksum_address


async def get_all_deposit_events_for_epoch(
    session: AsyncSession,
    epoch_number: int,
) -> dict[Address, Deposit]:
    results = await session.scalars(
        select(Deposit)
        .options(selectinload(Deposit.user))
        .where(Deposit.epoch == epoch_number)
    )

    return {
        transform_to_checksum_address(result.user.address): result for result in results
    }


async def get_user_deposit(
    session: AsyncSession,
    user_address: Address,
    epoch_number: int,
) -> Deposit:
    """
    Returns user's deposit for a given epoch.
    """

    return await session.scalar(
        select(Deposit)
        .join(User, Deposit.user_id == User.id)
        .where(User.address == user_address, Deposit.epoch == epoch_number)
    )
