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
        HistoryEntry(
            type=OpType.ALLOCATION,
            timestamp=int(e.timestamp.timestamp_s()),
            event_data=AllocationHistoryEntry(
                is_manually_edited=e.is_manually_edited, allocations=e.allocations
            ),
        )
        for e in allocations
    ]

    events += [
        HistoryEntry(
            type=OpType.PATRON_MODE_DONATION,
            timestamp=int(e.timestamp.timestamp_s()),
            event_data=PatronModeDonationEntry(epoch=e.epoch, amount=e.amount),
        )
        for e in patron_donations
    ]

    events += [
        HistoryEntry(
            type=e.type,
            timestamp=int(e.timestamp.timestamp_s()),
            event_data=TransactionHistoryEntry(
                transaction_hash=e.transaction_hash, amount=e.amount
            ),
        )
        for e in locks + unlocks + withdrawals
    ]

    return sorted(events, key=_sort_keys, reverse=True)


def _sort_keys(elem: HistoryEntry):
    return (
        elem.timestamp,
        elem.type,
        getattr(elem.event_data, "amount", None),
        getattr(elem.event_data, "transaction_hash", None),
    )
