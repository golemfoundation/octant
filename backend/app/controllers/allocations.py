from typing import List, Dict

from app import database
from app.controllers import rewards
from app.core.allocations import (
    AllocationRequest,
    recover_user_address,
    deserialize_payload,
    verify_allocations,
    add_allocations_to_db,
)
from app.core.common import AccountFunds
from app.extensions import db, epochs


def allocate(request: AllocationRequest):
    user_address = recover_user_address(request)
    user_allocations = deserialize_payload(request.payload)
    epoch = epochs.get_pending_epoch()
    verify_allocations(epoch, user_address, user_allocations)

    add_allocations_to_db(
        epoch, user_address, user_allocations, request.override_existing_allocations
    )
    db.session.commit()


def simulate_allocation(payload: Dict, user_address: str):
    user_allocations = deserialize_payload(payload)
    epoch = epochs.get_pending_epoch()
    verify_allocations(epoch, user_address, user_allocations)
    add_allocations_to_db(epoch, user_address, user_allocations, True)
    proposal_rewards = rewards.get_proposals_rewards(epoch)

    db.session.rollback()

    return proposal_rewards


def get_all_by_user_and_epoch(
    user_address: str, epoch: int = None
) -> List[AccountFunds]:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch

    allocations = database.allocations.get_all_by_user_addr_and_epoch(
        user_address, epoch
    )
    return [AccountFunds(a.proposal_address, a.amount) for a in allocations]


def get_all_by_proposal_and_epoch(
    proposal_address: str, epoch: int = None
) -> List[AccountFunds]:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch

    allocations = database.allocations.get_all_by_proposal_addr_and_epoch(
        proposal_address, epoch
    )
    return [AccountFunds(a.user.address, a.amount) for a in allocations]


def get_sum_by_epoch(epoch: int = None) -> int:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    return database.allocations.get_alloc_sum_by_epoch(epoch)
