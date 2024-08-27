from app.infrastructure.database.models import GPStamps, User
from eth_utils import to_checksum_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_gp_stamps_by_address(
    session: AsyncSession, user_address: str
) -> GPStamps | None:
    """Gets the latest GitcoinPassport Stamps record for a user."""

    result = await session.execute(
        select(GPStamps)
        .join(User)
        .filter(User.address == to_checksum_address(user_address))
        .order_by(GPStamps.created_at.desc())
    )

    return result.scalar_one_or_none()
