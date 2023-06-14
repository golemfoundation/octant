from dataclasses import dataclass
from typing import List

from app import database
from app.crypto.eip712 import recover_address, build_allocations_eip712_data
from app.extensions import db
from app.contracts.epochs import epochs


@dataclass(frozen=True)
class AllocationPayload:
    proposalAddress: str
    amount: int


def allocate(payload: dict, signature: str):
    eip712_data = build_allocations_eip712_data(payload)
    user_address = recover_address(eip712_data, signature)
    user_allocations = deserialize_payload(payload)

    epoch = epochs.get_pending_epoch()

    user = database.user.get_by_address(user_address)
    if not user:
        user = database.user.add_user(user_address)

    database.allocations.delete_all_by_epoch_and_user_id(epoch, user.id)
    database.allocations.add_all(epoch, user.id, user_allocations)

    db.session.commit()


# TODO remove duplication with the function above
#       function allocate() should not delete records just like that as it should not assume that
#       the payload was not "chunked"
def allocate_single_record(payload: dict, signature: str):
    eip712_data = build_allocations_eip712_data(payload)
    user_address = recover_address(eip712_data, signature)
    user_allocations = deserialize_payload(payload)

    epoch = epochs.get_pending_epoch()

    user = database.user.get_by_address(user_address)
    if not user:
        user = database.user.add_user(user_address)

    database.allocations.add_all(epoch, user.id, user_allocations)

    db.session.commit()


def deserialize_payload(payload) -> List[AllocationPayload]:
    return [
        AllocationPayload(**allocation_data)
        for allocation_data in payload["allocations"]
    ]


def calculate_threshold(total_allocated: int, proposals_no: int) -> int:
    return int(total_allocated / (proposals_no * 2))
