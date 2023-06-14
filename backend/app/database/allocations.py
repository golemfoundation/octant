from eth_utils import to_checksum_address

from app.database.models import Allocation
from app.extensions import db


def get_all_by_epoch(epoch):
    return Allocation.query.filter_by(epoch=epoch).all()


def get_all_by_epoch_and_user_id(epoch, user_id):
    return Allocation.query.filter_by(epoch=epoch, user_id=user_id).all()


def add_all(epoch, user_id, allocations):
    new_allocations = [
        Allocation(
            epoch=epoch,
            user_id=user_id,
            proposal_address=to_checksum_address(a.proposalAddress),
            amount=str(a.amount),
        )
        for a in allocations
    ]
    db.session.add_all(new_allocations)


def delete_all_by_epoch_and_user_id(epoch, user_id):
    existing_allocations = Allocation.query.filter_by(
        epoch=epoch, user_id=user_id
    ).all()
    for allocation in existing_allocations:
        db.session.delete(allocation)
