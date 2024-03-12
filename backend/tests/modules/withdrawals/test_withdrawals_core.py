import pytest

from app.infrastructure.database.models import Reward
from app.modules.common.merkle_tree import build_merkle_tree
from app.modules.dto import AccountFundsDTO, WithdrawalStatus
from app.modules.withdrawals.core import get_withdrawals
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS
from tests.helpers.context import get_context


@pytest.fixture(scope="function")
def merkle_trees():
    return {
        1: build_merkle_tree(
            [
                AccountFundsDTO(USER1_ADDRESS, 100_000000000),
                AccountFundsDTO(USER2_ADDRESS, 200_000000000),
            ],
        ),
        2: build_merkle_tree(
            [
                AccountFundsDTO(USER1_ADDRESS, 300_000000000),
                AccountFundsDTO(USER2_ADDRESS, 400_000000000),
            ],
        ),
    }


def test_get_finalized_withdrawable_eth(merkle_trees):
    rewards = [
        Reward(epoch=1, address=USER1_ADDRESS, amount=100_000000000),
        Reward(epoch=2, address=USER1_ADDRESS, amount=300_000000000),
    ]
    epochs_with_merkle_roots_set = [1, 2]

    result = get_withdrawals(
        None, USER1_ADDRESS, 0, rewards, merkle_trees, epochs_with_merkle_roots_set
    )

    assert len(result) == 2
    assert result[0].epoch == 1
    assert result[0].amount == 100_000000000
    assert result[0].status == WithdrawalStatus.AVAILABLE
    assert result[0].proof == [
        "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
    ]
    assert result[1].epoch == 2
    assert result[1].amount == 300_000000000
    assert result[1].status == WithdrawalStatus.AVAILABLE
    assert result[1].proof == [
        "0x339903fb80300f9cbf79e8bf8b9bb692c2896cf5607351cbdc3190c769b7f2bc"
    ]


def test_get_finalized_withdrawable_eth_epoch_2_merkle_root_not_set(merkle_trees):
    rewards = [
        Reward(epoch=1, address=USER1_ADDRESS, amount=100_000000000),
        Reward(epoch=2, address=USER1_ADDRESS, amount=300_000000000),
    ]
    epochs_with_merkle_roots_set = [1]

    result = get_withdrawals(
        None, USER1_ADDRESS, 0, rewards, merkle_trees, epochs_with_merkle_roots_set
    )

    assert len(result) == 2
    assert result[0].epoch == 1
    assert result[0].amount == 100_000000000
    assert result[0].status == WithdrawalStatus.AVAILABLE
    assert result[0].proof == [
        "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
    ]
    assert result[1].epoch == 2
    assert result[1].amount == 300_000000000
    assert result[1].status == WithdrawalStatus.PENDING
    assert result[1].proof == [
        "0x339903fb80300f9cbf79e8bf8b9bb692c2896cf5607351cbdc3190c769b7f2bc"
    ]


def test_get_pending_withdrawable_eth(merkle_trees):
    context = get_context(3)
    rewards = [
        Reward(epoch=1, address=USER1_ADDRESS, amount=100_000000000),
        Reward(epoch=2, address=USER1_ADDRESS, amount=300_000000000),
    ]
    epochs_with_merkle_roots_set = [1, 2]

    result = get_withdrawals(
        context,
        USER1_ADDRESS,
        500_000000000,
        rewards,
        merkle_trees,
        epochs_with_merkle_roots_set,
    )

    assert len(result) == 3
    assert result[0].epoch == 3
    assert result[0].amount == 500_000000000
    assert result[0].status == WithdrawalStatus.PENDING
    assert result[0].proof == []
    assert result[1].epoch == 1
    assert result[1].amount == 100_000000000
    assert result[1].status == WithdrawalStatus.AVAILABLE
    assert result[1].proof == [
        "0xeba8e145c1102400c42b1fc5de1fea439aeaa93a6b46ef370ecbc8f15140a2dd"
    ]
    assert result[2].epoch == 2
    assert result[2].amount == 300_000000000
    assert result[2].status == WithdrawalStatus.AVAILABLE
    assert result[2].proof == [
        "0x339903fb80300f9cbf79e8bf8b9bb692c2896cf5607351cbdc3190c769b7f2bc"
    ]
