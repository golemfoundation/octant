from typing import List

from eth_utils import to_checksum_address
from sqlalchemy import func

from app.constants import EPOCH0_SYBILS
from app.infrastructure.database.models import EpochZeroClaim
from app.extensions import db


def get_all(exclude_sybils=False) -> List[EpochZeroClaim]:
    query = EpochZeroClaim.query
    if exclude_sybils:
        checksum_sybils = [to_checksum_address(addr) for addr in EPOCH0_SYBILS]
        query = query.filter(EpochZeroClaim.address.notin_(checksum_sybils))
    return query.all()


def get_by_address(user_address: str) -> EpochZeroClaim:
    return EpochZeroClaim.query.filter_by(
        address=to_checksum_address(user_address)
    ).first()


def add_claim(user_address: str) -> EpochZeroClaim:
    claim = EpochZeroClaim(address=to_checksum_address(user_address))
    db.session.add(claim)

    return claim


def get_by_claimed_true_and_nonce_gte(nonce: int = 0) -> List[EpochZeroClaim]:
    return (
        EpochZeroClaim.query.filter(
            EpochZeroClaim.claimed == True,  # noqa: E712
            EpochZeroClaim.claim_nonce >= nonce,
        )
        .order_by(EpochZeroClaim.claim_nonce.asc())
        .all()
    )


def get_highest_claim_nonce() -> int:
    return db.session.query(func.max(EpochZeroClaim.claim_nonce)).scalar()


def claim_exists(user_address: str, exclude_sybils: bool = False) -> bool:
    query = EpochZeroClaim.query.filter_by(address=user_address)
    if exclude_sybils:
        checksum_sybils = [to_checksum_address(addr) for addr in EPOCH0_SYBILS]
        query = query.filter(EpochZeroClaim.address.notin_(checksum_sybils))
    return db.session.query(query.exists()).scalar()
