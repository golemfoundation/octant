from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models import MultisigSignatures
from app.infrastructure.database.multisig_signature import SigStatus
from app.modules.dto import SignatureOpType
from v2.core.types import Address


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


async def save_pending_tos(
    session: AsyncSession,
    user_address: Address,
    message: str,
    message_hash: str,
    safe_message_hash: str,
    ip_address: str,
) -> None:
    signature = MultisigSignatures(
        address=user_address,
        type=SignatureOpType.TOS,
        message=message,
        msg_hash=message_hash,
        safe_msg_hash=safe_message_hash,
        user_ip=ip_address,
        status=SigStatus.PENDING,
    )
    session.add(signature)


async def save_pending_allocation(
    session: AsyncSession,
    user_address: Address,
    message: str,
    message_hash: str,
    safe_message_hash: str,
    ip_address: str,
) -> None:
    signature = MultisigSignatures(
        address=user_address,
        type=SignatureOpType.ALLOCATION,
        message=message,
        msg_hash=message_hash,
        safe_msg_hash=safe_message_hash,
        user_ip=ip_address,
        status=SigStatus.PENDING,
    )
    session.add(signature)
