import pytest

from app.modules.common.time import from_timestamp_s
from app.modules.history.dto import (
    LockItem,
    OpType,
    ProjectAllocationItem,
    AllocationItem,
    PatronDonationItem,
    WithdrawalItem,
)
from app.modules.history.dto import (
    UserHistoryDTO,
    HistoryEntry,
    TransactionHistoryEntry,
    PatronModeDonationEntry,
    AllocationHistoryEntry,
)
from app.modules.history.service.full import FullHistory


@pytest.fixture(autouse=True)
def before(
    context,
    mock_user_deposits,
    mock_user_allocations,
    mock_patron_mode,
    mock_withdrawals,
):
    mock_user_deposits.get_locks.return_value = [
        LockItem(
            type=OpType.LOCK,
            amount=10,
            timestamp=from_timestamp_s(100),
            transaction_hash="tx1",
        )
    ]
    mock_user_deposits.get_unlocks.return_value = [
        LockItem(
            type=OpType.UNLOCK,
            amount=10,
            timestamp=from_timestamp_s(200),
            transaction_hash="tx2",
        )
    ]
    mock_user_allocations.get_user_allocations_by_timestamp.return_value = [
        AllocationItem(
            timestamp=from_timestamp_s(300),
            epoch=1,
            is_manually_edited=False,
            leverage="1015.15",
            allocations=[ProjectAllocationItem(project_address="proj1", amount=10)],
        )
    ]
    mock_patron_mode.get_patron_donations.return_value = [
        PatronDonationItem(timestamp=from_timestamp_s(400), epoch=1, amount=10)
    ]
    mock_withdrawals.get_withdrawals.return_value = [
        WithdrawalItem(
            type=OpType.WITHDRAWAL,
            amount=50,
            address="addr1",
            timestamp=from_timestamp_s(500),
            transaction_hash="tx3",
        )
    ]


def test_history(
    context,
    alice,
    mock_user_deposits,
    mock_user_allocations,
    mock_patron_mode,
    mock_withdrawals,
):
    history_service = FullHistory(
        user_deposits=mock_user_deposits,
        user_allocations=mock_user_allocations,
        user_withdrawals=mock_withdrawals,
        patron_donations=mock_patron_mode,
    )

    result = history_service.get_user_history(context, alice.address)

    assert result == UserHistoryDTO(
        history=[
            HistoryEntry(
                type=OpType.WITHDRAWAL,
                timestamp=500,
                event_data=TransactionHistoryEntry(
                    transaction_hash="tx3",
                    amount=50,
                ),
            ),
            HistoryEntry(
                type=OpType.PATRON_MODE_DONATION,
                timestamp=400,
                event_data=PatronModeDonationEntry(
                    epoch=1,
                    amount=10,
                ),
            ),
            HistoryEntry(
                type=OpType.ALLOCATION,
                timestamp=300,
                event_data=AllocationHistoryEntry(
                    is_manually_edited=False,
                    leverage="1015.15",
                    allocations=[
                        ProjectAllocationItem(
                            project_address="proj1",
                            amount=10,
                        )
                    ],
                ),
            ),
            HistoryEntry(
                type=OpType.UNLOCK,
                timestamp=200,
                event_data=TransactionHistoryEntry(
                    transaction_hash="tx2",
                    amount=10,
                ),
            ),
            HistoryEntry(
                type=OpType.LOCK,
                timestamp=100,
                event_data=TransactionHistoryEntry(
                    transaction_hash="tx1",
                    amount=10,
                ),
            ),
        ],
        next_cursor=None,
    )


def test_history_limit(
    context,
    alice,
    mock_user_deposits,
    mock_user_allocations,
    mock_patron_mode,
    mock_withdrawals,
):
    history_service = FullHistory(
        user_deposits=mock_user_deposits,
        user_allocations=mock_user_allocations,
        user_withdrawals=mock_withdrawals,
        patron_donations=mock_patron_mode,
    )

    result = history_service.get_user_history(context, alice.address, limit=3)

    assert len(result.history) == 3
    assert result.next_cursor == "MjAwLjA="
