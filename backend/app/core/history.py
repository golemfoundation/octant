from dataclasses import dataclass
from enum import StrEnum
from typing import List

from eth_utils import to_checksum_address

from app.database import allocations
from app.core.user.patron_mode import get_patrons_at_timestamp
from app.core.epochs import details as epochs_details
from app.utils.time import (
    Timestamp,
    from_datetime,
    from_timestamp_s,
)

from app.controllers import snapshots as snapshots_controller, user as user_controller
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


@dataclass(frozen=True)
class PatronDonationItem:
    timestamp: Timestamp
    epoch: int
    amount: int


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


def get_patron_donations(
    user_address: str, from_timestamp: Timestamp, limit: int
) -> List[PatronDonationItem]:
    user_address = to_checksum_address(user_address)

    last_finalized_snapshot = snapshots_controller.get_last_finalized_snapshot()

    epochs = epochs_details.get_epochs_details(
        last_finalized_snapshot - limit, last_finalized_snapshot
    )
    epochs.reverse()

    events = []

    for epoch in epochs:
        epoch_finalization_timestamp = from_timestamp_s(
            epoch.end_sec + epoch.decision_window_sec
        )

        if epoch_finalization_timestamp <= from_timestamp:
            patrons_at_epoch = get_patrons_at_timestamp(epoch_finalization_timestamp)
            if user_address in patrons_at_epoch:
                donation = user_controller.get_budget(user_address, epoch.epoch_no)

                events.append(
                    PatronDonationItem(
                        epoch=epoch.epoch_no,
                        timestamp=epoch_finalization_timestamp,
                        amount=donation,
                    )
                )

    return events
