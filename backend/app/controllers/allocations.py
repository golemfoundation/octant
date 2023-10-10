from typing import List, Dict, Tuple
from dataclasses import dataclass
from dataclass_wizard import JSONWizard
from typing import Optional

from app import database, exceptions
from app.controllers import rewards
from app.core.allocations import (
    AllocationRequest,
    recover_user_address,
    deserialize_payload,
    verify_allocations,
    add_allocations_to_db,
    store_allocations_signature,
    next_allocation_nonce,
    calculate_user_allocations_leverage,
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
    user = database.user.get_by_address(user_address)
    next_nonce = next_allocation_nonce(user)

    _make_allocation(
        request.payload, user_address, request.override_existing_allocations, next_nonce
    )
    user.allocation_nonce = next_nonce

    pending_epoch = epochs.get_pending_epoch()
    store_allocations_signature(
        pending_epoch, user_address, next_nonce, request.signature
    )

    db.session.commit()

    return user_address


def simulate_allocation(
    payload: Dict, user_address: str
) -> Tuple[float, List[rewards.ProposalReward]]:
    # TODO: nonce should not be required by the endpoint, but
    # the code below requires it to work.
    payload["nonce"] = -1

    _make_allocation(payload, user_address, True)
    simulated_rewards = rewards.get_estimated_proposals_rewards()
    db.session.rollback()

    leverage = calculate_user_allocations_leverage(simulated_rewards)

    return leverage, simulated_rewards


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


def _make_allocation(
    payload: Dict,
    user_address: str,
    delete_existing_user_epoch_allocations: bool,
    expected_nonce: Optional[int] = None,
):
    nonce, user_allocations = deserialize_payload(payload)
    epoch = epochs.get_pending_epoch()

    verify_allocations(epoch, user_address, user_allocations)

    if expected_nonce is not None and nonce != expected_nonce:
        raise exceptions.WrongAllocationsNonce(nonce, expected_nonce)

    add_allocations_to_db(
        epoch,
        user_address,
        nonce,
        user_allocations,
        delete_existing_user_epoch_allocations,
    )
