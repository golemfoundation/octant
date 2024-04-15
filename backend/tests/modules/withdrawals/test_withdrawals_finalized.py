import pytest

from app import db
from app.infrastructure import database
from app.modules.common.time import from_timestamp_s
from app.modules.dto import WithdrawableEth, WithdrawalStatus
from app.modules.history.dto import WithdrawalItem, OpType
from app.modules.withdrawals.service.finalized import FinalizedWithdrawals
from tests.conftest import mock_graphql


@pytest.fixture(autouse=True)
def before(mocker, app, graphql_client, patch_vault):
    merkle_roots = [{"epoch": 1}, {"epoch": 2}]
    mock_graphql(mocker, merkle_roots_events=merkle_roots)


def test_get_withdrawable_eth(context, alice, bob):
    database.rewards.add_user_reward(1, alice.address, 100_000000000)
    database.rewards.add_user_reward(1, bob.address, 200_000000000)
    database.rewards.add_user_reward(2, alice.address, 300_000000000)
    database.rewards.add_user_reward(2, bob.address, 400_000000000)
    db.session.commit()

    service = FinalizedWithdrawals()

    result = service.get_withdrawable_eth(context, alice.address)

    assert result == [
        WithdrawableEth(
            epoch=1,
            amount=100000000000,
            proof=[
                "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
            ],
            status=WithdrawalStatus.AVAILABLE,
        ),
        WithdrawableEth(
            epoch=2,
            amount=300000000000,
            proof=[
                "0x339903fb80300f9cbf79e8bf8b9bb692c2896cf5607351cbdc3190c769b7f2bc"
            ],
            status=WithdrawalStatus.AVAILABLE,
        ),
    ]


def test_get_withdrawals_by_timestamp(mocker, alice):
    mock_graphql(
        mocker,
        withdrawals_events=[
            {
                "amount": "50",
                "timestamp": 1710720000,
                "user": alice.address,
                "transactionHash": "tx1",
            },
            {
                "amount": "50",
                "timestamp": 1710720001,
                "user": alice.address,
                "transactionHash": "tx2",
            },
        ],
    )
    timestamp_before = from_timestamp_s(1710719999)
    timestamp_after = from_timestamp_s(1710720001)

    service = FinalizedWithdrawals()

    result_before = service.get_withdrawals(
        alice.address, from_timestamp=timestamp_before, limit=20
    )
    result_after = service.get_withdrawals(
        alice.address, from_timestamp=timestamp_after, limit=20
    )
    result_after_with_limit = service.get_withdrawals(
        alice.address, from_timestamp=timestamp_after, limit=1
    )

    assert result_before == []
    assert result_after == [
        WithdrawalItem(
            type=OpType.WITHDRAWAL,
            amount=50,
            address=alice.address,
            transaction_hash="tx2",
            timestamp=from_timestamp_s(1710720001),
        ),
        WithdrawalItem(
            type=OpType.WITHDRAWAL,
            amount=50,
            address=alice.address,
            transaction_hash="tx1",
            timestamp=from_timestamp_s(1710720000),
        ),
    ]
    assert result_after_with_limit == [
        WithdrawalItem(
            type=OpType.WITHDRAWAL,
            amount=50,
            address=alice.address,
            transaction_hash="tx2",
            timestamp=from_timestamp_s(1710720001),
        ),
    ]
