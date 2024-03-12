from typing_extensions import deprecated
from dataclasses import dataclass
from typing import List, Dict
from typing import Optional

from dataclass_wizard import JSONWizard

from app import exceptions
from app.extensions import db, epochs
from app.infrastructure import database
from app.modules.user.allocations import controller as new_controller
from app.legacy.core.allocations import (
    AllocationRequest,
    recover_user_address,
    deserialize_payload,
    verify_allocations,
    add_allocations_to_db,
    revoke_previous_allocation,
    store_allocation_request,
)
from app.legacy.core.common import AccountFunds
from app.legacy.core.epochs import epoch_snapshots


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
    next_nonce = new_controller.get_user_next_nonce(user_address)

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


@deprecated("ALLOCATIONS REWORK")
def get_all_by_user_and_epoch(
    user_address: str, epoch: int | None = None
) -> List[AccountFunds]:
    allocations = _get_user_allocations_for_epoch(user_address, epoch)
    return [AccountFunds(a.proposal_address, a.amount) for a in allocations]


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


@deprecated("ALLOCATIONS REWORK")
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
