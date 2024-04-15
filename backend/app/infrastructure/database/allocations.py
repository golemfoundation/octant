from collections import defaultdict
from datetime import datetime
from typing import List

from eth_utils import to_checksum_address
from sqlalchemy.orm import Query
from typing_extensions import deprecated

from app.extensions import db
from app.infrastructure.database.models import Allocation, User, AllocationRequest
from app.infrastructure.database.user import get_by_address
from app.modules.dto import (
    AllocationDTO,
    AccountFundsDTO,
    UserAllocationRequestPayload,
)


@deprecated("Use `get_all` function")
def get_all_by_epoch(epoch: int, with_deleted=False) -> List[Allocation]:
    query: Query = Allocation.query.filter_by(epoch=epoch)

    if not with_deleted:
        query = query.filter(Allocation.deleted_at.is_(None))

    return query.all()


def get_all(epoch: int) -> List[AllocationDTO]:
    allocations = (
        Allocation.query.filter_by(epoch=epoch)
        .filter(Allocation.deleted_at.is_(None))
        .all()
    )

    return [
        AllocationDTO(
            amount=int(a.amount),
            proposal_address=a.proposal_address,
            user_address=a.user.address,
        )
        for a in allocations
    ]


def get_user_allocations_history(
    user_address: str, from_datetime: datetime, limit: int
) -> List[Allocation]:
    user: User = get_by_address(user_address)
    if user is None:
        return []

    allocations = (
        Allocation.query.filter(Allocation.user_id == user.id)
        .filter(Allocation.created_at <= from_datetime)
        .order_by(Allocation.created_at.desc())
        .limit(limit)
        .all()
    )

    return allocations


def get_all_by_user_addr_and_epoch(
    user_address: str, epoch: int
) -> List[AccountFundsDTO]:
    allocations: List[Allocation] = (
        Allocation.query.join(User, User.id == Allocation.user_id)
        .filter(User.address == user_address)
        .filter(Allocation.epoch == epoch)
        .filter(Allocation.deleted_at.is_(None))
        .all()
    )

    return [
        AccountFundsDTO(
            address=alloc.proposal_address,
            amount=int(alloc.amount),
        )
        for alloc in allocations
    ]


def get_all_by_project_addr_and_epoch(
    project_address: str, epoch: int, with_deleted=False
) -> List[Allocation]:
    query: Query = Allocation.query.filter_by(
        proposal_address=to_checksum_address(project_address), epoch=epoch
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


def get_users_with_allocations(epoch_num: int) -> List[str]:
    users = User.query.filter(
        User.allocations.any(epoch=epoch_num, deleted_at=None)
    ).all()
    return [u.address for u in users]


def get_users_alloc_sum_by_epoch(epoch: int) -> List[AccountFundsDTO]:
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
        [
            AccountFundsDTO(address=i[0], amount=i[1])
            for i in allocations_by_user.items()
        ],
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


def get_user_alloc_sum_by_epoch(epoch: int, user_address: str) -> int:
    allocations = get_all_by_user_addr_and_epoch(user_address, epoch)
    return sum([int(a.amount) for a in allocations])


def store_allocation_request(
    user_address: str, epoch_num: int, request: UserAllocationRequestPayload, **kwargs
):
    user: User = get_by_address(user_address)

    options = {"is_manually_edited": None, **kwargs}

    new_allocations = [
        Allocation(
            epoch=epoch_num,
            user_id=user.id,
            nonce=request.payload.nonce,
            proposal_address=to_checksum_address(a.proposal_address),
            amount=str(a.amount),
        )
        for a in request.payload.allocations
    ]

    allocation_request = AllocationRequest(
        user_id=user.id,
        epoch=epoch_num,
        nonce=request.payload.nonce,
        signature=request.signature,
        is_manually_edited=options["is_manually_edited"],
    )

    db.session.add(allocation_request)
    db.session.add_all(new_allocations)


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
    return (
        AllocationRequest.query.join(User, User.id == AllocationRequest.user_id)
        .filter(User.address == user_address)
        .filter(AllocationRequest.epoch == epoch)
        .order_by(AllocationRequest.nonce.desc())
        .first()
    )


def get_user_last_allocation_request(user_address: str) -> AllocationRequest | None:
    return (
        AllocationRequest.query.join(User, User.id == AllocationRequest.user_id)
        .filter(User.address == user_address)
        .order_by(AllocationRequest.nonce.desc())
        .first()
    )
