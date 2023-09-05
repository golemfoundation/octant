from dataclasses import dataclass
from enum import StrEnum
from typing import List, Tuple, Optional
from operator import attrgetter

from dataclass_wizard import JSONWizard
from app.core import history
from app.core.pagination import Paginator, Cursor


class OpType(StrEnum):
    LOCK = "lock"
    UNLOCK = "unlock"
    ALLOCATION = "allocation"
    WITHDRAWAL = "withdrawal"


@dataclass(frozen=True)
class HistoryEntry(JSONWizard):
    type: OpType
    amount: int
    timestamp: int  # Should be in microseconds precision


def user_history(
    user_address: str, cursor: str = None, limit: int = 20
) -> Tuple[List[HistoryEntry], Optional[str]]:
    limit = limit if limit < 100 else 100

    (from_timestamp, offset_at_timestamp) = Cursor.decode(cursor)
    query_limit = Paginator.query_limit(limit, offset_at_timestamp)

    all = _collect_history_records(user_address, from_timestamp, query_limit)
    return Paginator.extract_page(all, offset_at_timestamp, limit)


def _collect_history_records(
    user_address, from_timestamp, query_limit
) -> List[HistoryEntry]:
    events = []
    for event_getter, event_type in [
        (history.get_allocations, OpType.ALLOCATION),
        (history.get_locks, OpType.LOCK),
        (history.get_unlocks, OpType.UNLOCK),
        (history.get_withdrawals, OpType.WITHDRAWAL),
    ]:
        events += [
            HistoryEntry(
                type=event_type,
                amount=e.amount,
                timestamp=e.timestamp.timestamp_us(),
            )
            for e in event_getter(user_address, from_timestamp, query_limit)
        ]

    sort_keys = attrgetter("timestamp", "type", "amount")
    return sorted(events, key=sort_keys, reverse=True)
