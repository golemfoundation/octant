from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import Deposit, User
from v2.snapshots.schemas import UserDepositV1
from v2.users.repositories import get_or_create_user
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


async def save_deposits(
    session: AsyncSession,
    epoch_number: int,
    deposits: list[UserDepositV1],
):
    for deposit in deposits:
        # We need to make sure the user exists in the database
        user = await get_or_create_user(session, deposit.user_address)
        deposit = Deposit(
            epoch=epoch_number,
            user_id=user.id,
            effective_deposit=str(deposit.effective_deposit),
            epoch_end_deposit=str(deposit.deposit),
        )

        session.add(deposit)
