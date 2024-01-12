from collections import defaultdict
from datetime import datetime
from typing import List, Optional

from eth_utils import to_checksum_address
from sqlalchemy import func
from sqlalchemy.orm import Query

from app.core.common import AccountFunds
from app.database.models import Allocation, AllocationRequest, User
from app.database.user import get_by_address
from app.exceptions import UserNotFound
from app.extensions import db


def get_all_by_epoch(epoch: int, with_deleted=False) -> List[Allocation]:
    query: Query = Allocation.query.filter_by(epoch=epoch)

    if not with_deleted:
        query = query.filter(Allocation.deleted_at.is_(None))

    return query.all()


def get_user_allocations_history(
    user_address: str, from_datetime: datetime, limit: int
) -> List[Allocation]:
    user: User = get_by_address(user_address)

    if user is None:
        return []

    user_allocations: Query = (
        Allocation.query.filter(
            Allocation.user_id == user.id, Allocation.created_at <= from_datetime
        )
        .order_by(Allocation.created_at.desc())
        .limit(limit)
        .subquery()
    )

    timestamp_at_limit_query = (
        db.session.query(
            func.min(user_allocations.c.created_at).label("limit_timestamp")
        )
        .group_by(user_allocations.c.user_id)
        .subquery()
    )

    allocations = Allocation.query.filter(
        Allocation.user_id == user.id,
        Allocation.created_at <= from_datetime,
        Allocation.created_at >= timestamp_at_limit_query.c.limit_timestamp,
    ).order_by(Allocation.created_at.desc())

    return allocations.all()


def get_all_by_user_addr_and_epoch(
    user_address: str, epoch: int, with_deleted=False
) -> List[Allocation]:
    user: User = get_by_address(user_address)

    if user is None:
        return []

    query: Query = Allocation.query.filter_by(user_id=user.id, epoch=epoch)

    if not with_deleted:
        query = query.filter(Allocation.deleted_at.is_(None))

    return query.all()


def get_all_by_proposal_addr_and_epoch(
    proposal_address: str, epoch: int, with_deleted=False
) -> List[Allocation]:
    query: Query = Allocation.query.filter_by(
        proposal_address=to_checksum_address(proposal_address), epoch=epoch
    )

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


def get_alloc_sum_by_epoch_and_user_address(epoch: int) -> List[AccountFunds]:
    allocations = (
        db.session.query(User, Allocation)
        .join(User, User.id == Allocation.user_id)
        .filter(Allocation.epoch == epoch)
        .filter(Allocation.deleted_at.is_(None))
        .order_by(User.address)
    ).all()

    allocations_by_user = defaultdict(int)

    for user, allocation in allocations:
        allocations_by_user[user.address] += int(allocation.amount)

    sorted_allocations = sorted(
        [AccountFunds(address=i[0], amount=i[1]) for i in allocations_by_user.items()],
        key=lambda item: item.address,
    )

    return sorted_allocations


def get_alloc_sum_by_epoch(epoch: int) -> int:
    allocations = (
        Allocation.query.filter(Allocation.epoch == epoch)
        .filter(Allocation.deleted_at.is_(None))
        .all()
    )
    return sum([int(a.amount) for a in allocations])


def add_all(epoch: int, user_id: int, nonce: int, allocations):
    now = datetime.utcnow()

    new_allocations = [
        Allocation(
            epoch=epoch,
            user_id=user_id,
            nonce=nonce,
            proposal_address=to_checksum_address(a.proposal_address),
            amount=str(a.amount),
            created_at=now,
        )
        for a in allocations
    ]
    db.session.add_all(new_allocations)


def add_allocation_request(
    user_address: str,
    epoch: int,
    nonce: int,
    signature: str,
    is_manually_edited: Optional[bool] = None,
):
    user: User = get_by_address(user_address)

    allocation_request = AllocationRequest(
        user=user,
        epoch=epoch,
        nonce=nonce,
        signature=signature,
        is_manually_edited=is_manually_edited,
    )

    db.session.add(allocation_request)


def get_allocation_request_by_user_nonce(
    user_address: str, nonce: int
) -> AllocationRequest | None:
    user: User = get_by_address(user_address)

    if user is None:
        return None

    return AllocationRequest.query.filter_by(user_id=user.id, nonce=nonce).first()


def soft_delete_all_by_epoch_and_user_id(epoch: int, user_id: int):
    existing_allocations = Allocation.query.filter_by(
        epoch=epoch, user_id=user_id, deleted_at=None
    ).all()

    now = datetime.utcnow()

    for allocation in existing_allocations:
        allocation.deleted_at = now
        db.session.add(allocation)


def get_allocation_request_by_user_and_epoch(
    user_address: str, epoch: int
) -> AllocationRequest | None:
    user: User = get_by_address(user_address)
    if user is None:
        raise UserNotFound(user_address)

    return AllocationRequest.query.filter_by(user_id=user.id, epoch=epoch).first()
