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


async def get_last_finalized_snapshot_epoch_number(
    session: AsyncSession,
) -> int:
    result = await session.scalar(
        select(FinalizedEpochSnapshot)
        .order_by(FinalizedEpochSnapshot.epoch.desc())
        .limit(1)
    )

    if result is None:
        return 0

    return result.epoch


async def get_last_pending_snapshot_epoch_number(
    session: AsyncSession,
) -> int:
    result = await session.scalar(
        select(PendingEpochSnapshot)
        .order_by(PendingEpochSnapshot.epoch.desc())
        .limit(1)
    )

    if result is None:
        return 0

    return result.epoch
