import pytest

from app.modules.common.time import from_timestamp_s
from app.modules.history.dto import (
    LockItem,
    OpType,
    PatronDonationItem,
    AllocationItem,
    WithdrawalItem,
)
from app.modules.history.core import sort_history_records
from app.modules.history.dto import (
    PatronModeDonationEntry,
    TransactionHistoryEntry,
    AllocationHistoryEntry,
)


@pytest.mark.parametrize(
    "locks, unlocks, allocations, withdrawals, patron_donations, expected_order",
    [
        # Test 1: Sorting primarily by timestamp
        (
            [
                LockItem(
                    type=OpType.LOCK,
                    amount=10,
                    timestamp=from_timestamp_s(1000),
                    transaction_hash="tx1",
                ),
                LockItem(
                    type=OpType.LOCK,
                    amount=10,
                    timestamp=from_timestamp_s(3000),
                    transaction_hash="tx2",
                ),
            ],
            [
                LockItem(
                    type=OpType.UNLOCK,
                    amount=10,
                    timestamp=from_timestamp_s(6000),
                    transaction_hash="tx4",
                ),
            ],
            [
                AllocationItem(
                    project_address="proj1",
                    epoch=1,
                    amount=100,
                    timestamp=from_timestamp_s(10000),
                )
            ],
            [
                WithdrawalItem(
                    type=OpType.WITHDRAWAL,
                    amount=50,
                    address="addr1",
                    timestamp=from_timestamp_s(7000),
                    transaction_hash="tx3",
                )
            ],
            [PatronDonationItem(timestamp=from_timestamp_s(2000), epoch=1, amount=20)],
            [
                AllocationHistoryEntry(
                    type=OpType.ALLOCATION,
                    timestamp_us=10000000000,
                    project_address="proj1",
                    amount=100,
                ),
                TransactionHistoryEntry(
                    type=OpType.WITHDRAWAL,
                    timestamp_us=7000000000,
                    transaction_hash="tx3",
                    amount=50,
                ),
                TransactionHistoryEntry(
                    type=OpType.UNLOCK,
                    amount=10,
                    timestamp_us=6000000000,
                    transaction_hash="tx4",
                ),
                TransactionHistoryEntry(
                    type=OpType.LOCK,
                    amount=10,
                    timestamp_us=3000000000,
                    transaction_hash="tx2",
                ),
                PatronModeDonationEntry(
                    type=OpType.PATRON_MODE_DONATION,
                    timestamp_us=2000000000,
                    epoch=1,
                    amount=20,
                ),
                TransactionHistoryEntry(
                    type=OpType.LOCK,
                    amount=10,
                    timestamp_us=1000000000,
                    transaction_hash="tx1",
                ),
            ],
        ),
        # Test 2: Tiebreaker with OpType
        (
            [],
            [],
            [
                AllocationItem(
                    project_address="proj1",
                    epoch=1,
                    amount=100,
                    timestamp=from_timestamp_s(500),
                )
            ],
            [
                WithdrawalItem(
                    type=OpType.WITHDRAWAL,
                    amount=50,
                    address="addr1",
                    timestamp=from_timestamp_s(500),
                    transaction_hash="tx2",
                )
            ],
            [],
            [
                TransactionHistoryEntry(
                    type=OpType.WITHDRAWAL,
                    amount=50,
                    timestamp_us=500000000,
                    transaction_hash="tx2",
                ),
                AllocationHistoryEntry(
                    type=OpType.ALLOCATION,
                    amount=100,
                    timestamp_us=500000000,
                    project_address="proj1",
                ),
            ],
        ),
        # Test 3: Sorting by project_address when other factors are equal
        (
            [],
            [],
            [
                AllocationItem(
                    project_address="projB",
                    epoch=1,
                    amount=10,
                    timestamp=from_timestamp_s(100),
                ),
                AllocationItem(
                    project_address="projA",
                    epoch=1,
                    amount=10,
                    timestamp=from_timestamp_s(100),
                ),
            ],
            [],
            [],
            [
                AllocationHistoryEntry(
                    type=OpType.ALLOCATION,
                    amount=10,
                    timestamp_us=100000000,
                    project_address="projB",
                ),
                AllocationHistoryEntry(
                    type=OpType.ALLOCATION,
                    amount=10,
                    timestamp_us=100000000,
                    project_address="projA",
                ),
            ],
        ),
    ],
)
def test_sort_history_records(
    locks, unlocks, allocations, withdrawals, patron_donations, expected_order
):
    result = sort_history_records(
        locks, unlocks, allocations, withdrawals, patron_donations
    )
    assert result == expected_order
