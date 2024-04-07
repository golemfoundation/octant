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
    HistoryEntry,
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
                HistoryEntry(
                    type=OpType.ALLOCATION,
                    timestamp=10000,
                    event_data=AllocationHistoryEntry(
                        project_address="proj1",
                        amount=100,
                    ),
                ),
                HistoryEntry(
                    type=OpType.WITHDRAWAL,
                    timestamp=7000,
                    event_data=TransactionHistoryEntry(
                        transaction_hash="tx3",
                        amount=50,
                    ),
                ),
                HistoryEntry(
                    type=OpType.UNLOCK,
                    timestamp=6000,
                    event_data=TransactionHistoryEntry(
                        amount=10,
                        transaction_hash="tx4",
                    ),
                ),
                HistoryEntry(
                    type=OpType.LOCK,
                    timestamp=3000,
                    event_data=TransactionHistoryEntry(
                        amount=10,
                        transaction_hash="tx2",
                    ),
                ),
                HistoryEntry(
                    type=OpType.PATRON_MODE_DONATION,
                    timestamp=2000,
                    event_data=PatronModeDonationEntry(
                        epoch=1,
                        amount=20,
                    ),
                ),
                HistoryEntry(
                    type=OpType.LOCK,
                    timestamp=1000,
                    event_data=TransactionHistoryEntry(
                        amount=10,
                        transaction_hash="tx1",
                    ),
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
                HistoryEntry(
                    type=OpType.WITHDRAWAL,
                    timestamp=500,
                    event_data=TransactionHistoryEntry(
                        amount=50,
                        transaction_hash="tx2",
                    ),
                ),
                HistoryEntry(
                    type=OpType.ALLOCATION,
                    timestamp=500,
                    event_data=AllocationHistoryEntry(
                        amount=100,
                        project_address="proj1",
                    ),
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
                HistoryEntry(
                    type=OpType.ALLOCATION,
                    timestamp=100,
                    event_data=AllocationHistoryEntry(
                        amount=10, project_address="projB"
                    ),
                ),
                HistoryEntry(
                    type=OpType.ALLOCATION,
                    timestamp=100,
                    event_data=AllocationHistoryEntry(
                        amount=10, project_address="projA"
                    ),
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
