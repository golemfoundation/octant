import pytest

from app import db
from app.infrastructure import database
from app.modules.dto import WithdrawableEth, WithdrawalStatus
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
