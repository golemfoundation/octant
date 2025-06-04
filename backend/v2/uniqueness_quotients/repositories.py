from datetime import datetime
from decimal import Decimal
import json
from typing import Optional

from app.infrastructure.database.models import GPStamps, UniquenessQuotient, User
from eth_utils import to_checksum_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.exceptions import UserNotFound
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


async def add_gp_stamps(
    session: AsyncSession,
    user_address: Address,
    score: float,
    expires_at: datetime,
    stamps: list[dict],
) -> GPStamps:
    """Adds a new GPStamps record to the database."""

    user = await get_user_by_address(session, user_address)
    if user is None:
        raise UserNotFound(user_address)

    assert (
        expires_at.tzinfo is None
    ), "expires_at must be in UTC and not have timezone info"

    gp_stamps = GPStamps(
        user_id=user.id,
        score=score,
        expires_at=expires_at,
        stamps=json.dumps(stamps),
    )

    session.add(gp_stamps)

    return gp_stamps


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


async def get_all_uqs_by_epoch(
    session: AsyncSession, epoch_number: int
) -> list[UniquenessQuotient]:
    """Returns UniquenessQuotient of all saved records for a given epoch."""

    results = await session.scalars(
        select(UniquenessQuotient)
        .options(joinedload(UniquenessQuotient.user))
        .filter(UniquenessQuotient.epoch == epoch_number)
    )

    return list(results.all())
