from sqlalchemy.orm import Query
from collections import defaultdict
from datetime import datetime
from typing import List

from eth_utils import to_checksum_address

from app.core.allocations import Allocation as CoreAllocation
from app.database.models import Allocation, User
from app.extensions import db
from app.database.user import get_by_address


def get_all_by_epoch(epoch: int, with_deleted=False) -> List[Allocation]:
    query: Query = Allocation.query.filter_by(epoch=epoch)

    if not with_deleted:
        query = query.filter(Allocation.deleted_at.is_(None))

    return query.all()


def get_all_by_user(user_address: str, with_deleted=False) -> List[Allocation]:
    user: User = get_by_address(user_address)

    query: Query = Allocation.query.filter_by(user_id=user.id)

    if not with_deleted:
        query = query.filter(Allocation.deleted_at.is_(None))

    return query.all()


def get_all_by_epoch_and_user_id(
    epoch: int, user_id: int, with_deleted=False
) -> List[Allocation]:
    query: Query = Allocation.query.filter_by(epoch=epoch, user_id=user_id)

    if not with_deleted:
        query = query.filter(Allocation.deleted_at.is_(None))

    return query.all()


def get_alloc_sum_by_epoch_and_user_address(
    epoch: int, with_deleted=False
) -> List[CoreAllocation]:
    query: Query = (
        db.session.query(User, Allocation)
        .join(User, User.id == Allocation.user_id)
        .filter(Allocation.epoch == epoch)
        .order_by(User.address)
    )

    if not with_deleted:
        query = query.filter(Allocation.deleted_at.is_(None))

    allocations = query.all()

    allocations_by_user = defaultdict(int)

    for user, allocation in allocations:
        allocations_by_user[user.address] += int(allocation.amount)

    sorted_allocations = sorted(
        [
            CoreAllocation(proposal_address=i[0], amount=i[1])
            for i in allocations_by_user.items()
        ],
        key=lambda item: item.proposal_address
    )

    return sorted_allocations


def add_all(epoch: int, user_id: int, allocations):
    now = datetime.now()

    new_allocations = [
        Allocation(
            epoch=epoch,
            user_id=user_id,
            proposal_address=to_checksum_address(a.proposal_address),
            amount=str(a.amount),
            created_at=now,
        )
        for a in allocations
    ]
    db.session.add_all(new_allocations)


def soft_delete_all_by_epoch_and_user_id(epoch: int, user_id: int):
    existing_allocations = Allocation.query.filter_by(
        epoch=epoch, user_id=user_id, deleted_at=None
    ).all()

    now = datetime.now()

    for allocation in existing_allocations:
        allocation.deleted_at = now
        db.session.add(allocation)
