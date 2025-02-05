from app.infrastructure.database.models import (
    FinalizedEpochSnapshot,
    PendingEpochSnapshot,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_pending_epoch_snapshot(
    session: AsyncSession, epoch_number: int
) -> PendingEpochSnapshot | None:
    result = await session.execute(
        select(PendingEpochSnapshot).filter(PendingEpochSnapshot.epoch == epoch_number)
    )
    return result.scalar_one_or_none()


async def get_finalized_epoch_snapshot(
    session: AsyncSession, epoch_number: int
) -> FinalizedEpochSnapshot | None:
    result = await session.execute(
        select(FinalizedEpochSnapshot).filter(
            FinalizedEpochSnapshot.epoch == epoch_number
        )
    )
    return result.scalar_one_or_none()
