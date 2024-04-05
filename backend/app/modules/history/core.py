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
    locks: list[LockItem],
    unlocks: list[LockItem],
    allocations: list[AllocationItem],
    withdrawals: list[WithdrawalItem],
    patron_donations: list[PatronDonationItem],
) -> list[HistoryEntry]:
    events = [
        AllocationHistoryEntry(
            type=OpType.ALLOCATION,
            amount=e.amount,
            timestamp_us=e.timestamp.timestamp_us(),
            project_address=e.project_address,
        )
        for e in allocations
    ]

    events += [
        PatronModeDonationEntry(
            type=OpType.PATRON_MODE_DONATION,
            timestamp_us=e.timestamp.timestamp_us(),
            epoch=e.epoch,
            amount=e.amount,
        )
        for e in patron_donations
    ]

    events += [
        TransactionHistoryEntry(
            type=e.type,
            amount=e.amount,
            timestamp_us=e.timestamp.timestamp_us(),
            transaction_hash=e.transaction_hash,
        )
        for e in locks + unlocks + withdrawals
    ]

    return sorted(events, key=_sort_keys, reverse=True)


def _sort_keys(elem: AllocationHistoryEntry | TransactionHistoryEntry):
    return (
        elem.timestamp_us,
        elem.type,
        getattr(elem, "amount", None),
        getattr(elem, "project_address", None),
        getattr(elem, "transaction_hash", None),
    )
