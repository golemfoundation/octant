from typing_extensions import deprecated
from dataclasses import dataclass
from typing import List
from typing import Optional

from dataclass_wizard import JSONWizard

from app import exceptions
from app.extensions import epochs
from app.infrastructure import database
from app.modules.user.allocations import controller as new_controller
from app.legacy.core.allocations import (
    AllocationRequest,
)
from app.legacy.core.common import AccountFunds
from app.legacy.core.epochs import epoch_snapshots


@dataclass(frozen=True)
class EpochAllocationRecord(JSONWizard):
    donor: str
    amount: int  # in wei
    proposal: str


@deprecated("ALLOCATIONS REWORK")
def allocate(
    request: AllocationRequest, is_manually_edited: Optional[bool] = None
) -> str:
    return new_controller.allocate(request, is_manually_edited=is_manually_edited)


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



def _get_user_allocations_for_epoch(user_address: str, epoch: int | None = None):
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    return database.allocations.get_all_by_user_addr_and_epoch(user_address, epoch)
