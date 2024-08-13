

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.infrastructure.database.models import PendingEpochSnapshot


async def get_pending_epoch_snapshot_by_epoch(session: AsyncSession, epoch: int) -> PendingEpochSnapshot | None:
    
    result = await session.execute(select(PendingEpochSnapshot).filter(PendingEpochSnapshot.epoch == epoch))
    return result.scalars().first()
