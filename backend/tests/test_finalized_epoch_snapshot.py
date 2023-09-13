import pytest

from app import database, exceptions
from app.controllers.snapshots import (
    finalized_snapshot_status,
    snapshot_finalized_epoch,
)
from app.core.user import get_claimed_rewards
from tests.conftest import (
    allocate_user_rewards,
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    MOCK_EPOCHS,
)

MOCKED_FINALIZED_EPOCH_NO = 42


@pytest.fixture(autouse=True)
def before(
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
):
    MOCK_EPOCHS.get_finalized_epoch.return_value = MOCKED_FINALIZED_EPOCH_NO


def test_finalized_epoch_snapshot_with_rewards(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    user1_allocation = 1000_000000000
    user2_allocation = 2000_000000000
    allocate_user_rewards(user_accounts[0], proposal_accounts[0], user1_allocation)
    allocate_user_rewards(user_accounts[1], proposal_accounts[1], user2_allocation)

    result = snapshot_finalized_epoch()
    assert result == 42

    rewards = database.rewards.get_by_epoch(result)
    assert len(rewards) == 4
    assert rewards[0].address == user_accounts[1].address
    assert rewards[0].amount == str(3016082_191780824)
    assert rewards[1].address == proposal_accounts[1].address
    assert rewards[1].amount == str(1_272090565_608826698)
    assert rewards[2].address == proposal_accounts[0].address
    assert rewards[2].amount == str(636045282_804413348)
    assert rewards[3].address == user_accounts[0].address
    assert rewards[3].amount == str(602616_460640476)

    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(result)
    _, claimed_rewards_sum = get_claimed_rewards(result)
    rewards_back_to_gf = (
        ALL_INDIVIDUAL_REWARDS
        - claimed_rewards_sum
        - user1_allocation
        - user2_allocation
    )
    assert int(snapshot.total_withdrawals) == pytest.approx(
        TOTAL_REWARDS - rewards_back_to_gf, 0.000000000000000001
    )
    assert (
        snapshot.withdrawals_merkle_root
        == "0x1b1ee37b6b2d3d1eee6a90e412324fb0d4935a09ecc9ab2f66bc03addcd2ca58"
    )
    assert snapshot.created_at is not None


def test_finalized_epoch_snapshot_without_rewards(
    user_accounts, proposal_accounts, mock_pending_epoch_snapshot_db
):
    result = snapshot_finalized_epoch()
    assert result == 42

    rewards = database.rewards.get_by_epoch(result)
    assert len(rewards) == 0

    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(result)
    assert snapshot.total_withdrawals is None
    assert snapshot.withdrawals_merkle_root is None
    assert snapshot.created_at is not None


@pytest.mark.parametrize(
    "epoch, snapshot, is_open, expected",
    [
        (1, 1, False, "not_applicable"),
        (1, 1, True, "not_applicable"),
        (2, 1, False, "done"),
        (2, 1, True, "error"),  # snapshot performed before voting ended, illegal
        (2, 0, True, "too_early"),
        (5, 3, True, "too_early"),
        (2, 0, False, "in_progress"),
        (5, 3, False, "in_progress"),
        (3, 0, True, "error"),  # snapshot not performed on time
        (3, 0, False, "error"),  # snapshot not performed on time
    ],
)
def test_finalized_snapshot_status(epoch, snapshot, is_open, expected):
    output = None
    try:
        output = finalized_snapshot_status(epoch, snapshot, is_open)
    except exceptions.OctantException:
        output = "error"
    assert output == expected
