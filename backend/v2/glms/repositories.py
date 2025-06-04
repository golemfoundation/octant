from sqlalchemy import func, select
from app.infrastructure.database.models import EpochZeroClaim
from v2.core.types import Address
from sqlalchemy.ext.asyncio import AsyncSession


async def get_claimable_glms(
    session: AsyncSession, address: Address
) -> EpochZeroClaim | None:
    user_claim = await session.scalar(
        select(EpochZeroClaim).where(EpochZeroClaim.address == address).limit(1)
    )

    return user_claim


async def get_highest_claim_nonce(session: AsyncSession) -> int | None:
    return await session.scalar(select(func.max(EpochZeroClaim.claim_nonce)))
