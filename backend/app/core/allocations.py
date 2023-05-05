from dataclasses import dataclass
from typing import List

from app.crypto.eip712 import recover_address, build_allocations_eip712_data
from app.database import User, Allocation
from app.extensions import db


@dataclass(frozen=True)
class AllocationPayload:
    proposalAddress: str
    amount: int


def allocate(payload: dict, signature: str):
    eip712_data = build_allocations_eip712_data(payload)
    user_address = recover_address(eip712_data, signature)
    user_allocations = deserialize_payload(payload)

    # TODO connect Epochs contract
    epoch = 1

    user = User.query.filter_by(address=user_address).first()
    if not user:
        user = User(address=user_address)
        db.session.add(user)

    # Delete any existing allocations for the current epoch and user
    existing_allocations = Allocation.query.filter_by(epoch=epoch, user_id=user.id).all()
    for allocation in existing_allocations:
        db.session.delete(allocation)

    # Create new Allocation instances for the provided allocations
    new_allocations = [Allocation(epoch=epoch, user_id=user.id, proposal_address=a.proposalAddress,
                                  amount=a.amount) for a in user_allocations]

    db.session.add_all(new_allocations)
    db.session.commit()


def deserialize_payload(payload) -> List[AllocationPayload]:
    return [AllocationPayload(**allocation_data) for allocation_data in
            payload['allocations']]
