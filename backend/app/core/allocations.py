from dataclasses import dataclass
from typing import List

from dataclass_wizard import JSONWizard

from app import database, exceptions
from app.core.epochs import has_pending_epoch_snapshot
from app.crypto.eip712 import recover_address, build_allocations_eip712_data
from app.extensions import db
from app.contracts.epochs import epochs
from app.contracts.proposals import proposals


@dataclass(frozen=True)
class Allocation(JSONWizard):
    proposal_address: str
    amount: int


@dataclass(frozen=True)
class AllocationRequest:
    payload: dict
    signature: str
    override_existing_allocations: bool


def verify_allocations(epoch: int, allocations: List[Allocation]):
    if epoch == 0:
        raise exceptions.NotInDecisionWindow

    if not has_pending_epoch_snapshot(epoch):
        raise exceptions.MissingSnapshot

    # Check if the list of proposal addresses is a subset of
    # proposal addresses in the Proposals contract
    proposal_addresses = [a.proposal_address for a in allocations]
    valid_proposals = proposals.get_proposal_addresses(epoch)
    invalid_proposals = list(set(proposal_addresses) - set(valid_proposals))

    if invalid_proposals:
        raise exceptions.InvalidProposals(invalid_proposals)


def store_allocations_in_db(
    epoch: int,
    user_address: str,
    allocations: List[Allocation],
    prune_existing_user_epoch_allocations: bool,
):
    user = database.user.get_by_address(user_address)
    if not user:
        user = database.user.add_user(user_address)

    if prune_existing_user_epoch_allocations:
        database.allocations.delete_all_by_epoch_and_user_id(epoch, user.id)

    database.allocations.add_all(epoch, user.id, allocations)
    db.session.commit()


def allocate(request: AllocationRequest):
    user_address = get_user_address(request)
    user_allocations = get_allocations(request)
    epoch = epochs.get_pending_epoch()

    verify_allocations(epoch, user_allocations)
    store_allocations_in_db(
        epoch, user_address, user_allocations, request.override_existing_allocations
    )


def get_user_address(request: AllocationRequest) -> str:
    eip712_data = build_allocations_eip712_data(request.payload)
    return recover_address(eip712_data, request.signature)


def get_allocations(request: AllocationRequest) -> List[Allocation]:
    return deserialize_payload(request.payload)


def deserialize_payload(payload) -> List[Allocation]:
    return [
        Allocation.from_dict(allocation_data)
        for allocation_data in payload["allocations"]
    ]


def calculate_threshold(total_allocated: int, proposals_no: int) -> int:
    return int(total_allocated / (proposals_no * 2))
