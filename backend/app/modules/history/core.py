from typing import List

from app.modules.history.dto import (
    OpType,
    LockItem,
    AllocationItem,
    WithdrawalItem,
    PatronDonationItem,
)
from app.modules.history.dto import (
    HistoryEntry,
    AllocationHistoryEntry,
    PatronModeDonationEntry,
    TransactionHistoryEntry,
)


def sort_history_records(
    locks: List[LockItem],
    unlocks: List[LockItem],
    allocations: List[AllocationItem],
    withdrawals: List[WithdrawalItem],
    patron_donations: List[PatronDonationItem],
) -> List[HistoryEntry]:
    events = [
        AllocationHistoryEntry(
            type=OpType.ALLOCATION,
            amount=e.amount,
            timestamp=int(e.timestamp.timestamp_s()),
            project_address=e.project_address,
        )
        for e in allocations
    ]

    events += [
        PatronModeDonationEntry(
            type=OpType.PATRON_MODE_DONATION,
            timestamp=int(e.timestamp.timestamp_s()),
            epoch=e.epoch,
            amount=e.amount,
        )
        for e in patron_donations
    ]

    events += [
        TransactionHistoryEntry(
            type=e.type,
            amount=e.amount,
            timestamp=int(e.timestamp.timestamp_s()),
            transaction_hash=e.transaction_hash,
        )
        for e in locks + unlocks + withdrawals
    ]

    return sorted(events, key=_sort_keys, reverse=True)


def _sort_keys(
    elem: AllocationHistoryEntry | TransactionHistoryEntry | PatronModeDonationEntry,
):
    return (
        elem.timestamp,
        elem.type,
        getattr(elem, "amount", None),
        getattr(elem, "project_address", None),
        getattr(elem, "transaction_hash", None),
    )
