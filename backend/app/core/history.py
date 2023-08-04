import datetime
from dataclasses import dataclass
from enum import StrEnum
from typing import List

from app.database import allocations

from app.infrastructure.graphql.locks import get_locks_by_address
from app.infrastructure.graphql.unlocks import get_unlocks_by_address
from app.infrastructure.graphql.withdrawals import get_withdrawals_by_address_and_ts


class OpType(StrEnum):
    LOCK = "lock"
    UNLOCK = "unlock"


@dataclass(frozen=True)
class LockItem:
    type: OpType
    amount: int
    timestamp: int  # Should be in microseconds


@dataclass(frozen=True)
class AllocationItem:
    address: str
    epoch: int
    amount: int
    timestamp: int  # Should be in microseconds


@dataclass(frozen=True)
class WithdrawalItem:
    amount: int
    address: str
    timestamp: int  # Should be in microseconds


def get_locks(user_address: str, from_timestamp_us: int) -> List[LockItem]:
    return [
        LockItem(
            type=OpType.LOCK,
            amount=int(r["amount"]),
            timestamp=_seconds_to_microseconds(r["timestamp"]),
        )
        for r in get_locks_by_address(user_address)
        if int(r["timestamp"]) >= from_timestamp_us
    ]


def get_unlocks(user_address: str, from_timestamp_us: int) -> List[LockItem]:
    return [
        LockItem(
            type=OpType.UNLOCK,
            amount=int(r["amount"]),
            timestamp=_seconds_to_microseconds(r["timestamp"]),
        )
        for r in get_unlocks_by_address(user_address)
        if int(r["timestamp"]) >= from_timestamp_us
    ]


def get_allocations(user_address: str, from_timestamp_us: int) -> List[AllocationItem]:
    return [
        AllocationItem(
            address=r.proposal_address,
            epoch=r.epoch,
            amount=int(r.amount),
            timestamp=_datetime_to_microseconds(r.created_at),
        )
        for r in allocations.get_all_by_user(user_address, with_deleted=True)
        if _datetime_to_microseconds(r.created_at) >= from_timestamp_us
    ]


def get_withdrawals(user_address: str, from_timestamp_s: int) -> List[WithdrawalItem]:
    return [
        WithdrawalItem(
            address=r["user"],
            amount=int(r["amount"]),
            timestamp=_seconds_to_microseconds(r["timestamp"]),
        )
        for r in get_withdrawals_by_address_and_ts(user_address, from_timestamp_s)
    ]


def _datetime_to_microseconds(date: datetime.datetime) -> int:
    return int(date.timestamp() * 10**6)


def _seconds_to_microseconds(timestamp: int) -> int:
    return timestamp * 10**6
