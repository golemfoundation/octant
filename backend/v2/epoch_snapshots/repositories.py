from app.infrastructure.database.models import PendingEpochSnapshot
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_pending_epoch_snapshot(
    session: AsyncSession, epoch_number: int
) -> PendingEpochSnapshot | None:
    result = await session.execute(
        select(PendingEpochSnapshot).filter(PendingEpochSnapshot.epoch == epoch_number)
    )
    return result.scalar_one_or_none()
