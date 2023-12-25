from dataclasses import dataclass
from enum import StrEnum
from typing import List, Tuple, Optional

from dataclass_wizard import JSONWizard
from app.core import history
from app.core.pagination import Paginator, Cursor


class OpType(StrEnum):
    LOCK = "lock"
    UNLOCK = "unlock"
    ALLOCATION = "allocation"
    WITHDRAWAL = "withdrawal"
    PATRON_MODE_DONATION = "patron_mode_donation"


@dataclass(frozen=True)
class HistoryEntry(JSONWizard):
    type: OpType
    timestamp: int  # Should be in microseconds precision


@dataclass(frozen=True)
class TransactionHistoryEntry(HistoryEntry):
    transaction_hash: str
    amount: int


@dataclass(frozen=True)
class AllocationHistoryEntry(HistoryEntry):
    project_address: str
    amount: int


@dataclass(frozen=True)
class PatronModeDonation(HistoryEntry):
    epoch: int
    amount: int


def user_history(
    user_address: str, cursor: str = None, limit: int = 20
) -> Tuple[List[HistoryEntry], Optional[str]]:
    limit = limit if limit is not None and limit < 100 else 100

    (from_timestamp, offset_at_timestamp) = Cursor.decode(cursor)
    query_limit = Paginator.query_limit(limit, offset_at_timestamp)

    all = _collect_history_records(user_address, from_timestamp, query_limit)
    return Paginator.extract_page(all, offset_at_timestamp, limit)


def _collect_history_records(
    user_address, from_timestamp, query_limit
) -> List[HistoryEntry]:
    events = [
        AllocationHistoryEntry(
            type=OpType.ALLOCATION,
            amount=e.amount,
            timestamp=e.timestamp.timestamp_us(),
            project_address=e.project_address,
        )
        for e in history.get_allocations(user_address, from_timestamp, query_limit)
    ]

    events += [
        PatronModeDonation(
            type=OpType.PATRON_MODE_DONATION,
            timestamp=e.timestamp.timestamp_us(),
            epoch=e.epoch,
            amount=e.amount,
        )
        for e in history.get_patron_donations(user_address, from_timestamp, query_limit)
    ]

    for event_getter, event_type in [
        (history.get_locks, OpType.LOCK),
        (history.get_unlocks, OpType.UNLOCK),
        (history.get_withdrawals, OpType.WITHDRAWAL),
    ]:
        events += [
            TransactionHistoryEntry(
                type=event_type,
                amount=e.amount,
                timestamp=e.timestamp.timestamp_us(),
                transaction_hash=e.transaction_hash,
            )
            for e in event_getter(user_address, from_timestamp, query_limit)
        ]

    return sorted(events, key=_sort_keys, reverse=True)


def _sort_keys(elem: AllocationHistoryEntry | TransactionHistoryEntry):
    return (
        elem.timestamp,
        elem.type,
        getattr(elem, "amount", None),
        getattr(elem, "project_address", None),
        getattr(elem, "transaction_hash", None),
        getattr(elem, "patron_mode_enabled", None),
    )
