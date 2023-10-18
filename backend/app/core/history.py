from dataclasses import dataclass
from enum import StrEnum
from typing import List

from app.database import allocations
from app.utils.time import (
    Timestamp,
    from_datetime,
    from_timestamp_s,
)

from app.infrastructure.graphql import locks, unlocks, withdrawals


class OpType(StrEnum):
    LOCK = "lock"
    UNLOCK = "unlock"


@dataclass(frozen=True)
class LockItem:
    type: OpType
    amount: int
    timestamp: Timestamp
    transaction_hash: str


@dataclass(frozen=True)
class AllocationItem:
    project_address: str
    epoch: int
    amount: int
    timestamp: Timestamp


@dataclass(frozen=True)
class WithdrawalItem:
    amount: int
    address: str
    timestamp: Timestamp
    transaction_hash: str


def get_locks(
    user_address: str, from_timestamp: Timestamp, limit: int
) -> List[LockItem]:
    return [
        LockItem(
            type=OpType.LOCK,
            amount=int(r["amount"]),
            timestamp=from_timestamp_s(r["timestamp"]),
            transaction_hash=r["transactionHash"],
        )
        for r in locks.get_user_locks_history(
            user_address, int(from_timestamp.timestamp_s()), limit
        )
    ]


def get_unlocks(
    user_address: str, from_timestamp: Timestamp, limit: int
) -> List[LockItem]:
    return [
        LockItem(
            type=OpType.UNLOCK,
            amount=int(r["amount"]),
            timestamp=from_timestamp_s(r["timestamp"]),
            transaction_hash=r["transactionHash"],
        )
        for r in unlocks.get_user_unlocks_history(
            user_address, int(from_timestamp.timestamp_s()), limit
        )
    ]


def get_allocations(
    user_address: str, from_timestamp: Timestamp, limit: int
) -> List[AllocationItem]:
    return [
        AllocationItem(
            project_address=r.proposal_address,
            epoch=r.epoch,
            amount=int(r.amount),
            timestamp=from_datetime(r.created_at),
        )
        for r in allocations.get_user_allocations_history(
            user_address, from_timestamp.datetime(), limit
        )
    ]


def get_withdrawals(
    user_address: str, from_timestamp: Timestamp, limit: int
) -> List[WithdrawalItem]:
    return [
        WithdrawalItem(
            address=r["user"],
            amount=int(r["amount"]),
            timestamp=from_timestamp_s(r["timestamp"]),
            transaction_hash=r["transactionHash"],
        )
        for r in withdrawals.get_user_withdrawals_history(
            user_address, int(from_timestamp.timestamp_s()), limit
        )
    ]
