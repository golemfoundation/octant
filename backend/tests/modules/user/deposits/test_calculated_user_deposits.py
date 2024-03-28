from app.engine.user.effective_deposit import UserDeposit
from app.modules.common.time import from_timestamp_s
from app.modules.history.dto import LockItem, OpType
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from tests.conftest import USER1_ADDRESS, mock_graphql
from tests.helpers.context import get_context


def test_get_total_effective_deposit(mock_events_generator):
    context = get_context()
    service = CalculatedUserDeposits(events_generator=mock_events_generator)

    result = service.get_total_effective_deposit(context)

    assert result == 50_000000000_000000000


def test_get_user_effective_deposit(
    mock_events_generator,
):
    context = get_context()
    service = CalculatedUserDeposits(events_generator=mock_events_generator)

    result = service.get_user_effective_deposit(context, USER1_ADDRESS)

    assert result == 50_000000000_000000000


def test_get_all_deposits(
    mock_events_generator,
):
    context = get_context()
    service = CalculatedUserDeposits(events_generator=mock_events_generator)

    result = service.get_all_effective_deposits(context)

    assert result[0] == [
        UserDeposit(
            user_address=USER1_ADDRESS,
            effective_deposit=50_000000000_000000000,
            deposit=100000000000000000000,
        )
    ]
    assert result[1] == 50_000000000_000000000


def test_get_locks_by_timestamp(app, mocker, alice, mock_events_generator):
    mock_graphql(
        mocker,
        deposit_events=[
            {
                "__typename": "Locked",
                "timestamp": 1710720000,
                "amount": "50",
                "transactionHash": "tx1",
            },
            {
                "__typename": "Locked",
                "timestamp": 1710720001,
                "amount": "50",
                "transactionHash": "tx2",
            },
        ],
    )

    timestamp_before = from_timestamp_s(1710719999)
    timestamp_after = from_timestamp_s(1710720001)

    service = CalculatedUserDeposits(events_generator=mock_events_generator)

    result_before = service.get_locks(
        alice.address, from_timestamp=timestamp_before, limit=20
    )
    result_after = service.get_locks(
        alice.address, from_timestamp=timestamp_after, limit=20
    )
    result_after_with_limit = service.get_locks(
        alice.address, from_timestamp=timestamp_after, limit=1
    )
    _check_deposits_by_ts(
        result_before, result_after, result_after_with_limit, OpType.LOCK
    )


def test_get_unlocks_by_timestamp(app, mocker, alice, mock_events_generator):
    mock_graphql(
        mocker,
        deposit_events=[
            {
                "__typename": "Unlocked",
                "timestamp": 1710720000,
                "amount": "50",
                "transactionHash": "tx1",
            },
            {
                "__typename": "Unlocked",
                "timestamp": 1710720001,
                "amount": "50",
                "transactionHash": "tx2",
            },
        ],
    )

    timestamp_before = from_timestamp_s(1710719999)
    timestamp_after = from_timestamp_s(1710720001)

    service = CalculatedUserDeposits(events_generator=mock_events_generator)

    result_before = service.get_unlocks(
        alice.address, from_timestamp=timestamp_before, limit=20
    )
    result_after = service.get_unlocks(
        alice.address, from_timestamp=timestamp_after, limit=20
    )
    result_after_with_limit = service.get_unlocks(
        alice.address, from_timestamp=timestamp_after, limit=1
    )
    _check_deposits_by_ts(
        result_before, result_after, result_after_with_limit, OpType.UNLOCK
    )


def _check_deposits_by_ts(
    result_before, result_after, result_after_with_limit, event_type
):
    assert result_before == []
    assert result_after == [
        LockItem(
            type=event_type,
            amount=50,
            transaction_hash="tx2",
            timestamp=from_timestamp_s(1710720001),
        ),
        LockItem(
            type=event_type,
            amount=50,
            transaction_hash="tx1",
            timestamp=from_timestamp_s(1710720000),
        ),
    ]
    assert result_after_with_limit == [
        LockItem(
            type=event_type,
            amount=50,
            transaction_hash="tx2",
            timestamp=from_timestamp_s(1710720001),
        ),
    ]
