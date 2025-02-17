from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import Deposit
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
