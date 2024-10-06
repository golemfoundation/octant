from app.infrastructure.database.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from v2.core.types import Address


async def get_user_by_address(
    session: AsyncSession, user_address: Address
) -> User | None:
    """Get a user object by their address. Useful for all other operations related to a user."""

    import time

    start = time.time()

    result = await session.scalar(
        select(User).filter(User.address == user_address).limit(1)
    )

    print("USER BY ADDRESS", time.time() - start)
    return result
