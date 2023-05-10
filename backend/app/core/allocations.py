from dataclasses import dataclass
from typing import List

from app import database
from app.crypto.eip712 import recover_address, build_allocations_eip712_data
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

    user = database.user.get_by_address(user_address)
    if not user:
        user = database.user.add_user(user_address)

    database.allocations.delete_all_by_epoch_and_user_id(epoch, user.id)
    database.allocations.add_all(epoch, user.id, user_allocations)

    db.session.commit()


def deserialize_payload(payload) -> List[AllocationPayload]:
    return [
        AllocationPayload(**allocation_data)
        for allocation_data in payload["allocations"]
    ]
