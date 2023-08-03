from typing import List

from eth_utils import to_checksum_address
from sqlalchemy import func

from app.database.models import EpochZeroClaim
from app.extensions import db


def get_all() -> List[EpochZeroClaim]:
    return EpochZeroClaim.query.all()


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
