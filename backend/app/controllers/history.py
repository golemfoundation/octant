from dataclasses import dataclass
from enum import StrEnum
from typing import List

from dataclass_wizard import JSONWizard
from app.core import history


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


def user_history(user_address: str) -> List[HistoryEntry]:
    allocations = [
        HistoryEntry(
            type=OpType.ALLOCATION,
            amount=r.amount,
            timestamp=r.timestamp,
        )
        for r in history.get_allocations(user_address, 0)
    ]

    locks = [
        HistoryEntry(
            type=OpType.LOCK,
            amount=r.amount,
            timestamp=r.timestamp,
        )
        for r in history.get_locks(user_address, 0)
    ]

    unlocks = [
        HistoryEntry(
            type=OpType.UNLOCK,
            amount=r.amount,
            timestamp=r.timestamp,
        )
        for r in history.get_unlocks(user_address, 0)
    ]

    withdrawals = [
        HistoryEntry(
            type=OpType.WITHDRAWAL,
            amount=r.amount,
            timestamp=r.timestamp,
        )
        for r in history.get_withdrawals(user_address, 0)
    ]

    combined = allocations + locks + unlocks + withdrawals

    return sorted(combined, key=lambda x: x.timestamp, reverse=True)
