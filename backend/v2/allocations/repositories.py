

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


from backend.app.infrastructure.database.models import Allocation


async def sum_allocations_by_epoch(session: AsyncSession, epoch: int) -> int:
    """Get the sum of all allocations for a given epoch. We only consider the allocations that have not been deleted.
    """

    result = await session.execute(
        select(func.sum(Allocation.amount)).filter(Allocation.epoch == epoch).filter(Allocation.deleted_at.is_(None))
    )
    count = result.scalar()
    return count