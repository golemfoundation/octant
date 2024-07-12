from typing import Optional
from datetime import datetime
import json

from app.infrastructure.database.models import GPStamps
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
