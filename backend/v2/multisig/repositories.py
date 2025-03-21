from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models import MultisigSignatures, ProjectsDetails
from backend.app.infrastructure.database.multisig_signature import SigStatus
from backend.app.modules.dto import SignatureOpType
from backend.v2.core.types import Address


async def get_last_pending_multisig(
    session: AsyncSession,
    user_address: Address,
    op_type: SignatureOpType,
) -> MultisigSignatures | None:

    result = await session.scalars(
        select(MultisigSignatures)
        .filter(MultisigSignatures.address == user_address)
        .filter(MultisigSignatures.type == op_type)
        .filter(MultisigSignatures.status == SigStatus.PENDING)
        .order_by(MultisigSignatures.created_at.desc())
        .limit(1)
    )
    return result.first()


async def get_multisigs_for_tos(
    session: AsyncSession,
) -> list[MultisigSignatures]:

    result = await session.scalars(
        select(MultisigSignatures)
        .filter(MultisigSignatures.type == SignatureOpType.TOS)
        .filter(MultisigSignatures.status == SigStatus.PENDING)
    )
    return list(result.all())


async def get_multisigs_for_allocation(
    session: AsyncSession,
) -> list[MultisigSignatures]:

    result = await session.scalars(
        select(MultisigSignatures)
        .filter(MultisigSignatures.type == SignatureOpType.ALLOCATION)
        .filter(MultisigSignatures.status == SigStatus.PENDING)
    )
    return list(result.all())