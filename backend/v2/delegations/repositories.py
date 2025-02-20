from app.infrastructure.database.models import ScoreDelegation
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def contains_hashed_address(session: AsyncSession, hashed_address: str) -> bool:
    """Checks if the database contains a record with the given hashed address."""

    result = await session.scalar(
        select(ScoreDelegation).filter(ScoreDelegation.hashed_addr == hashed_address)
    )

    return result is not None
