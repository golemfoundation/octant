from collections import defaultdict
from datetime import datetime
from typing import List, Tuple

from eth_utils import to_checksum_address
from sqlalchemy import func
from sqlalchemy.orm import Query, joinedload
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
            project_address=a.project_address,
            user_address=a.user.address,
        )
        for a in allocations
    ]


def get_all_with_uqs(epoch: int) -> List[AllocationDTO]:
    allocations = (
        Allocation.query.filter_by(epoch=epoch)
        .filter(Allocation.deleted_at.is_(None))
        .options(joinedload(Allocation.user).joinedload(User.uniqueness_quotients))
        .all()
    )

    return [
        AllocationDTO(
            amount=int(a.amount),
            project_address=a.project_address,
            user_address=a.user.address,
            uq_score=next(
                (
                    uq.validated_score
                    for uq in a.user.uniqueness_quotients
                    if uq.epoch == epoch
                ),
                None,
            ),
        )
        for a in allocations
    ]


def get_user_allocations_history(
    user_address: str, from_datetime: datetime, limit: int
) -> List[Tuple[AllocationRequest, List[Allocation]]]:
    user: User = get_by_address(user_address)
    if user is None:
        return []

    allocation_requests = (
        AllocationRequest.query.filter(AllocationRequest.user_id == user.id)
        .filter(AllocationRequest.created_at <= from_datetime)
        .order_by(AllocationRequest.created_at.desc(), AllocationRequest.nonce.desc())
        .limit(limit)
        .all()
    )

    nonces = [alloc_request.nonce for alloc_request in allocation_requests]

    allocations = (
        Allocation.query.filter(Allocation.user_id == user.id)
        .filter(Allocation.nonce.in_(nonces))
        .all()
    )

    return [
        (
            alloc_request,
            list(filter(lambda alloc: alloc.nonce == alloc_request.nonce, allocations)),
        )
        for alloc_request in allocation_requests
    ]


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
            address=alloc.project_address,
            amount=int(alloc.amount),
        )
        for alloc in allocations
    ]


def get_all_by_project_addr_and_epoch(
    project_address: str, epoch: int, with_deleted=False
) -> List[Allocation]:
    query: Query = Allocation.query.filter_by(
        project_address=to_checksum_address(project_address), epoch=epoch
    ).options(joinedload(Allocation.user))

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

    options = {"is_manually_edited": None, "leverage": None, **kwargs}

    new_allocations = [
        Allocation(
            epoch=epoch_num,
            user_id=user.id,
            nonce=request.payload.nonce,
            project_address=to_checksum_address(a.project_address),
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
        leverage=options["leverage"],
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


def get_user_allocation_epoch_count(user_address: str) -> int:
    epoch_count = (
        db.session.query(func.count(AllocationRequest.epoch.distinct()))
        .join(User, User.id == AllocationRequest.user_id)
        .filter(User.address == user_address)
        .scalar()
    )

    return epoch_count
