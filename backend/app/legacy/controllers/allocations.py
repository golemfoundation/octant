from typing_extensions import deprecated
from dataclasses import dataclass
from typing import List
from typing import Optional

from dataclass_wizard import JSONWizard

from app.extensions import epochs
from app.infrastructure import database
from app.modules.user.allocations import controller as new_controller
from app.legacy.core.allocations import (
    AllocationRequest,
)


@deprecated("ALLOCATIONS REWORK")
def allocate(
    request: AllocationRequest, is_manually_edited: Optional[bool] = None
) -> str:
    return new_controller.allocate(request, is_manually_edited=is_manually_edited)


@deprecated("ALLOCATIONS REWORK")
def get_all_by_user_and_epoch(user_address: str, epoch: int | None = None):
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    allocations = database.allocations.get_all_by_user_addr_and_epoch(
        user_address, epoch
    )
    return [(a.proposal_address, a.amount) for a in allocations]
