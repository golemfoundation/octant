from app.infrastructure.database.models import (
    FinalizedEpochSnapshot,
    PendingEpochSnapshot,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import exceptions


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
        select(FinalizedEpochSnapshot.epoch)
        .order_by(FinalizedEpochSnapshot.epoch.desc())
        .limit(1)
    )

    return result or 0


async def get_last_finalized_epoch_snapshot(
    session: AsyncSession,
) -> FinalizedEpochSnapshot:
    """
    Returns the last finalized epoch snapshot.
    Raises MissingSnapshot if no snapshot is found.
    """

    result = await session.execute(
        select(FinalizedEpochSnapshot)
        .order_by(FinalizedEpochSnapshot.epoch.desc())
        .limit(1)
    )

    snapshot = result.scalar_one_or_none()
    if snapshot is None:
        raise exceptions.MissingSnapshot()

    return snapshot


async def get_last_pending_snapshot_epoch_number(
    session: AsyncSession,
) -> int:
    result = await session.scalar(
        select(PendingEpochSnapshot.epoch)
        .order_by(PendingEpochSnapshot.epoch.desc())
        .limit(1)
    )

    return result or 0
