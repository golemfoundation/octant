from typing import List, Dict, Tuple
from dataclasses import dataclass
from dataclass_wizard import JSONWizard
from typing import Optional

from app import database, exceptions
from app.controllers import rewards
from app.controllers.rewards import ProposalReward
from app.core.allocations import (
    AllocationRequest,
    recover_user_address,
    deserialize_payload,
    verify_allocations,
    add_allocations_to_db,
    revoke_previous_allocation,
    store_allocation_request,
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


def allocate(
    request: AllocationRequest, is_manually_edited: Optional[bool] = None
) -> str:
    user_address = recover_user_address(request)
    user = database.user.get_by_address(user_address)
    next_nonce = next_allocation_nonce(user)

    _make_allocation(
        request.payload, user_address, request.override_existing_allocations, next_nonce
    )
    user.allocation_nonce = next_nonce

    pending_epoch = epochs.get_pending_epoch()
    store_allocation_request(
        pending_epoch, user_address, next_nonce, request.signature, is_manually_edited
    )

    db.session.commit()

    return user_address


def simulate_allocation(
    payload: Dict, user_address: str
) -> Tuple[float, List[rewards.ProposalReward]]:
    # TODO: nonce should not be required by the endpoint, but
    # the code below requires it to work.
    payload["nonce"] = -1

    revoke_previous_user_allocation(user_address)
    base_rewards = sorted(
        rewards.get_estimated_proposals_rewards(), key=lambda p: p.address
    )
    _make_allocation(payload, user_address, False)
    simulated_rewards = sorted(
        rewards.get_estimated_proposals_rewards(), key=lambda p: p.address
    )
    db.session.rollback()

    leverage = calculate_user_allocations_leverage(simulated_rewards)

    rewards_diff = [
        ProposalReward(
            base.address,
            int(simulated.allocated),
            int(simulated.matched) - int(base.matched),
        )
        for base, simulated in zip(base_rewards, simulated_rewards)
    ]

    return leverage, rewards_diff


def get_all_by_user_and_epoch(
    user_address: str, epoch: int | None = None
) -> List[AccountFunds]:
    allocations = _get_user_allocations_for_epoch(user_address, epoch)
    return [AccountFunds(a.proposal_address, a.amount) for a in allocations]


def get_last_request_by_user_and_epoch(
    user_address: str, epoch: int | None = None
) -> (List[AccountFunds], Optional[bool]):
    allocations = _get_user_allocations_for_epoch(user_address, epoch)

    is_manually_edited = None
    if allocations:
        allocation_nonce = allocations[0].nonce
        alloc_request = database.allocations.get_allocation_request_by_user_nonce(
            user_address, allocation_nonce
        )
        is_manually_edited = alloc_request.is_manually_edited

    return [
        AccountFunds(a.proposal_address, a.amount) for a in allocations
    ], is_manually_edited


def get_all_by_proposal_and_epoch(
    proposal_address: str, epoch: int = None
) -> List[AccountFunds]:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch

    allocations = database.allocations.get_all_by_proposal_addr_and_epoch(
        proposal_address, epoch
    )
    return [
        AccountFunds(a.user.address, a.amount)
        for a in allocations
        if int(a.amount) != 0
    ]


def get_abstainers(epoch: int) -> List[str]:
    allocs = get_all_by_epoch(epoch, include_zeroes=True)
    active = [alloc.donor for alloc in allocs]
    all_with_budget = [budget["user"] for budget in rewards.get_all_budgets(epoch)]
    return list(set(all_with_budget) - set(active))


def get_all_by_epoch(
    epoch: int, include_zeroes: bool = False
) -> List[EpochAllocationRecord]:
    if epoch > epoch_snapshots.get_last_pending_snapshot():
        raise exceptions.EpochAllocationPeriodNotStartedYet(epoch)

    allocations = database.allocations.get_all_by_epoch(epoch)

    return [
        EpochAllocationRecord(a.user.address, a.amount, a.proposal_address)
        for a in allocations
        if int(a.amount) != 0 or include_zeroes
    ]


def get_sum_by_epoch(epoch: int | None = None) -> int:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    return database.allocations.get_alloc_sum_by_epoch(epoch)


def get_allocation_nonce(user_address: str) -> int:
    user = database.user.get_by_address(user_address)
    return next_allocation_nonce(user)


def revoke_previous_user_allocation(user_address: str):
    pending_epoch = epochs.get_pending_epoch()

    if pending_epoch is None:
        raise exceptions.NotInDecisionWindow

    revoke_previous_allocation(user_address, pending_epoch)


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


def _get_user_allocations_for_epoch(user_address: str, epoch: int | None = None):
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    return database.allocations.get_all_by_user_addr_and_epoch(user_address, epoch)
