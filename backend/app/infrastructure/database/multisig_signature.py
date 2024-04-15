from dataclasses import dataclass
from enum import StrEnum
from typing import Optional, List

from app.extensions import db
from app.infrastructure.database.models import MultisigSignatures
from app.modules.dto import SignatureOpType


class SigStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"


@dataclass
class MultisigFilters:
    type: SignatureOpType | None
    status: SigStatus | None

    @property
    def filters(self):
        filters = {}
        if self.type:
            filters["type"] = self.type.value
        if self.status:
            filters["status"] = self.status.value
        return filters


def get_last_pending_signature(
    user_address: str, op_type: SignatureOpType
) -> Optional[MultisigSignatures]:
    last_signature = MultisigSignatures.query.filter_by(
        address=user_address, type=op_type, status=SigStatus.PENDING
    ).order_by(MultisigSignatures.created_at.desc())

    return last_signature.first()


def get_multisig_signatures_by_filters(
    filters: MultisigFilters,
) -> List[MultisigSignatures]:
    return MultisigSignatures.query.filter_by(**filters.filters).all()


def save_signature(
    user_address: str,
    op_type: SignatureOpType,
    message: str,
    msg_hash: str,
    safe_msg_hash: str,
    user_ip: str,
    status: SigStatus = SigStatus.PENDING,
):
    signature = MultisigSignatures(
        address=user_address,
        type=op_type,
        message=message,
        msg_hash=msg_hash,
        safe_msg_hash=safe_msg_hash,
        user_ip=user_ip,
        status=status,
    )
    db.session.add(signature)
