from decimal import Decimal
from typing import Optional

from app import db
from app.infrastructure.database.models import UniquenessQuotient, User
from app.infrastructure.database.user import get_by_address as get_user_by_address


def get_uq_by_user(user: User, epoch: int) -> Optional[UniquenessQuotient]:
    query = UniquenessQuotient.query.join(User)
    query = query.filter(
        UniquenessQuotient.user_id == user.id, UniquenessQuotient.epoch == epoch
    )

    return query.one_or_none()


def get_uq_by_address(user_address: str, epoch: int) -> Optional[UniquenessQuotient]:
    user: User = get_user_by_address(user_address)

    return get_uq_by_user(user, epoch)


def save_uq(user: User, epoch: int, score: Decimal):
    uq: UniquenessQuotient = UniquenessQuotient(
        epoch=epoch,
        user_id=user.id,
        score=str(score),
    )

    db.session.add(uq)
