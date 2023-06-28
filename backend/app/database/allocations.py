from collections import defaultdict
from typing import List

from eth_utils import to_checksum_address

from app.core.common import AddressAndAmount
from app.database.models import Allocation, User
from app.extensions import db


def get_all_by_epoch(epoch: int) -> List[Allocation]:
    return Allocation.query.filter_by(epoch=epoch).all()


def get_all_by_epoch_and_user_id(epoch: int, user_id: int) -> List[Allocation]:
    return Allocation.query.filter_by(epoch=epoch, user_id=user_id).all()


def get_alloc_sum_by_epoch_and_user_address(epoch: int) -> List[AddressAndAmount]:
    allocations = (
        db.session.query(User, Allocation)
        .join(User, User.id == Allocation.user_id)
        .filter(Allocation.epoch == epoch)
        .order_by(User.address)
        .all()
    )

    allocations_by_user = defaultdict(int)

    for user, allocation in allocations:
        allocations_by_user[user.address] += int(allocation.amount)

    sorted_allocations = sorted(allocations_by_user.items(), key=lambda item: item[0])

    return [AddressAndAmount(address=a, amount=b) for a, b in sorted_allocations]


def add_all(epoch: int, user_id: int, allocations):
    new_allocations = [
        Allocation(
            epoch=epoch,
            user_id=user_id,
            proposal_address=to_checksum_address(a.proposal_address),
            amount=str(a.amount),
        )
        for a in allocations
    ]
    db.session.add_all(new_allocations)


def delete_all_by_epoch_and_user_id(epoch: int, user_id: int):
    existing_allocations = Allocation.query.filter_by(
        epoch=epoch, user_id=user_id
    ).all()
    for allocation in existing_allocations:
        db.session.delete(allocation)
