from typing import List, Dict, Tuple
from dataclasses import dataclass
from dataclass_wizard import JSONWizard

from app import database, exceptions
from app.controllers import rewards
from app.core.allocations import (
    AllocationRequest,
    recover_user_address,
    deserialize_payload,
    verify_allocations,
    add_allocations_to_db,
    next_allocation_nonce,
)
from app.core.common import AccountFunds
from app.core.epochs import epoch_snapshots
from app.extensions import db, epochs


@dataclass(frozen=True)
class EpochAllocationRecord(JSONWizard):
    donor: str
    amount: int  # in wei
    proposal: str


def allocate(request: AllocationRequest) -> str:
    user_address = recover_user_address(request)
    nonce, user_allocations = deserialize_payload(request.payload)
    epoch = epochs.get_pending_epoch()
    verify_allocations(epoch, user_address, user_allocations)

    user = database.user.get_by_address(user_address)
    expected_nonce = next_allocation_nonce(user)
    if nonce != expected_nonce:
        raise exceptions.WrongAllocationsNonce(nonce, expected_nonce)

    user.allocation_nonce = nonce

    add_allocations_to_db(
        epoch,
        user_address,
        nonce,
        user_allocations,
        request.override_existing_allocations,
    )

    db.session.commit()

    return user_address


def simulate_allocation(
    payload: Dict, user_address: str
) -> Tuple[int, List[rewards.ProposalReward]]:
    nonce, user_allocations = deserialize_payload(payload)
    epoch = epochs.get_pending_epoch()
    verify_allocations(epoch, user_address, user_allocations)
    add_allocations_to_db(epoch, user_address, nonce, user_allocations, True)
    proposal_rewards = rewards.get_proposals_rewards(epoch)

    db.session.rollback()

    individual_allocation = sum(map(lambda x: x.allocated, proposal_rewards))
    matched_funds = sum(map(lambda x: x.matched, proposal_rewards))
    leverage = (matched_funds / individual_allocation) * 100

    return int(leverage), proposal_rewards


def get_all_by_user_and_epoch(
    user_address: str, epoch: int | None = None
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


def get_all_by_epoch(epoch: int) -> List[EpochAllocationRecord]:
    if epoch > epoch_snapshots.get_last_pending_snapshot():
        raise exceptions.EpochAllocationPeriodNotStartedYet(epoch)

    allocations = database.allocations.get_all_by_epoch(epoch)

    return [
        EpochAllocationRecord(a.user.address, a.amount, a.proposal_address)
        for a in allocations
    ]


def get_sum_by_epoch(epoch: int | None = None) -> int:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    return database.allocations.get_alloc_sum_by_epoch(epoch)


def get_allocation_nonce(user_address: str) -> int:
    user = database.user.get_by_address(user_address)
    return next_allocation_nonce(user)
