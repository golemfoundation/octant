import pytest

from app import db
from app.infrastructure import database
from app.modules.dto import WithdrawableEth, WithdrawalStatus
from app.modules.withdrawals.service.pending import PendingWithdrawals
from tests.conftest import mock_graphql
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(mocker, app, graphql_client, patch_vault):
    merkle_roots = [{"epoch": 1}]
    mock_graphql(mocker, merkle_roots_events=merkle_roots)


def test_get_withdrawable_eth(alice, bob, mock_user_rewards):
    context = get_context(2)
    mock_user_rewards.get_user_claimed_rewards.return_value = 50_000000000
    database.rewards.add_user_reward(1, alice.address, 100_000000000)
    database.rewards.add_user_reward(1, bob.address, 200_000000000)
    db.session.commit()

    service = PendingWithdrawals(user_rewards=mock_user_rewards)

    result = service.get_withdrawable_eth(context, alice.address)

    assert result == [
        WithdrawableEth(
            epoch=2, amount=50000000000, proof=[], status=WithdrawalStatus.PENDING
        ),
        WithdrawableEth(
            epoch=1,
            amount=100000000000,
            proof=[
                "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
            ],
            status=WithdrawalStatus.AVAILABLE,
        ),
    ]
