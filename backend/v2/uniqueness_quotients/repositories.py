from decimal import Decimal
from typing import Optional

from app.infrastructure.database.models import GPStamps, UniquenessQuotient, User
from eth_utils import to_checksum_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from v2.core.types import Address
from v2.users.repositories import get_user_by_address


async def get_uq_score_by_user_address(
    session: AsyncSession, user_address: Address, epoch_number: int
) -> Optional[Decimal]:
    """Returns saved UQ score for a user in a given epoch.
    None if the UQ score is not saved (allocation not made yet).
    """

    result = await session.execute(
        select(UniquenessQuotient)
        .join(User)
        .filter(User.address == to_checksum_address(user_address))
        .filter(UniquenessQuotient.epoch == epoch_number)
    )

    uq = result.scalars().first()
    return uq.validated_score if uq else None


async def save_uq_score_for_user_address(
    session: AsyncSession, user_address: Address, epoch_number: int, score: Decimal
):
    """Saves UQ score for a user in a given epoch."""

    user = await get_user_by_address(session, user_address)

    if not user:
        return None

    uq_score = UniquenessQuotient(
        epoch=epoch_number,
        user_id=user.id,
        score=str(score),
    )

    session.add(uq_score)
    await session.commit()


async def get_gp_stamps_by_address(
    session: AsyncSession, user_address: Address
) -> GPStamps | None:
    """Gets the latest GitcoinPassport Stamps record for a user."""

    user = await get_user_by_address(session, user_address)
    if user is None:
        return None

    result = await session.scalar(
        select(GPStamps)
        .filter(GPStamps.user_id == user.id)
        .order_by(GPStamps.created_at.desc())
        .limit(1)
    )

    return result
