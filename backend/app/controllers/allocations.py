from typing import List

from app import database
from app.contracts import epochs
from app.core.common import AccountFunds


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
