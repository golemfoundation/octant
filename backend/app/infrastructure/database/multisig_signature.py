from enum import StrEnum
from typing import Optional

from app.extensions import db
from app.infrastructure.database.models import MultisigSignatures
from app.modules.dto import SignatureOpType


class SigStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"


def get_last_pending_signature(
    user_address: str, op_type: SignatureOpType
) -> Optional[MultisigSignatures]:
    last_signature = MultisigSignatures.query.filter_by(
        address=user_address, type=op_type, status=SigStatus.PENDING
    ).order_by(MultisigSignatures.created_at.desc())

    return last_signature.first()


def get_all_pending_signatures() -> list[MultisigSignatures]:
    return MultisigSignatures.query.filter_by(status=SigStatus.PENDING).all()


def save_signature(
    user_address: str,
    op_type: SignatureOpType,
    message: str,
    msg_hash: str,
    user_ip: str,
    status: SigStatus = SigStatus.PENDING,
):
    signature = MultisigSignatures(
        address=user_address,
        type=op_type,
        message=message,
        hash=msg_hash,
        user_ip=user_ip,
        status=status,
    )
    db.session.add(signature)
