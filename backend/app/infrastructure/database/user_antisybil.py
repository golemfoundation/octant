from typing import Optional
from datetime import datetime
import json

from typing import List

from app.infrastructure.database.models import GPStamps, HolonymSBT
from app.infrastructure.database.user import get_by_address
from app.exceptions import UserNotFound
from app.extensions import db


def add_score(
    user_address: str, score: float, expires_at: datetime, stamps: dict
) -> GPStamps:
    user = get_by_address(user_address)

    if user is None:
        raise UserNotFound(user_address)

    verification = GPStamps(
        user_id=user.id,
        score=str(score),
        expires_at=expires_at,
        stamps=json.dumps(stamps),
    )
    db.session.add(verification)

    return verification


def get_score_by_address(user_address: str) -> Optional[GPStamps]:
    user = get_by_address(user_address)
    if user is None:
        raise UserNotFound(user_address)

    return (
        GPStamps.query.order_by(GPStamps.created_at.desc())
        .filter_by(user_id=user.id)
        .first()
    )


def get_sbt_by_address(user_address: str) -> Optional[HolonymSBT]:
    user = get_by_address(user_address)
    if user is None:
        raise UserNotFound(user_address)

    return (
        HolonymSBT.query.order_by(HolonymSBT.created_at.desc())
        .filter_by(user_id=user.id)
        .first()
    )


def add_sbt(user_address: str, has_sbt: bool, sbt_details: List[str]) -> HolonymSBT:
    user = get_by_address(user_address)

    if user is None:
        raise UserNotFound(user_address)

    verification = HolonymSBT(
        user_id=user.id, has_sbt=has_sbt, sbt_details=json.dumps(sbt_details)
    )
    db.session.add(verification)

    return verification
