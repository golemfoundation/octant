from app.infrastructure.database.models import ScoreDelegation
from sqlalchemy import select, exists
from sqlalchemy.ext.asyncio import AsyncSession

from v2.core.types import Address


async def contains_hashed_address(session: AsyncSession, hashed_address: str) -> bool:
    """Checks if the database contains a record with the given hashed address."""

    result = await session.scalar(
        select(exists().where(ScoreDelegation.hashed_addr == hashed_address))
    )

    return result


async def find_hashes(session: AsyncSession, hashes: list[str]) -> list[str]:
    """Checks if the database contains any of the given hashes.
    And returns the matches as a list of unique hashes.
    """

    result = await session.scalars(
        select(ScoreDelegation.hashed_addr).where(
            ScoreDelegation.hashed_addr.in_(hashes)
        )
    )

    return list(set(result))


async def save_delegation(
    session: AsyncSession,
    primary: Address,
    secondary: Address,
    both: Address,
) -> None:
    """Save a delegation to the database."""

    session.add_all(
        [
            ScoreDelegation(hashed_addr=primary),
            ScoreDelegation(hashed_addr=secondary),
            ScoreDelegation(hashed_addr=both),
        ]
    )

    await session.commit()
