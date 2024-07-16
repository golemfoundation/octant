from decimal import Decimal
from typing import List, Optional

from app import db
from app.infrastructure.database.models import UniquenessQuotient, User
from app.infrastructure.database.user import get_by_address as get_user_by_address


def get_uq_by_user(user: User, epoch: int) -> Optional[UniquenessQuotient]:
    query = UniquenessQuotient.query.join(User)
    query = query.filter(
        UniquenessQuotient.user_id == user.id, UniquenessQuotient.epoch == epoch
    )

    return query.one_or_none()


def list_all_uqs_by_epoch(epoch: int) -> List[UniquenessQuotient]:
    query = UniquenessQuotient.query.join(User)
    query = query.filter(UniquenessQuotient.epoch == epoch)
    return query.all()


def get_uq_by_address(user_address: str, epoch: int) -> Optional[UniquenessQuotient]:
    user: User = get_user_by_address(user_address)

    if not user:
        return None

    return get_uq_by_user(user, epoch)


def save_uq(user: User, epoch: int, score: float):
    uq: UniquenessQuotient = UniquenessQuotient(
        epoch=epoch,
        user_id=user.id,
        score=str(score),
    )

    db.session.add(uq)


def save_uq_from_address(user_address: str, epoch: int, score: Decimal):
    user: User = get_user_by_address(user_address)

    save_uq(user, epoch, score)
