from unittest.mock import MagicMock, Mock

import pytest

from app import database
from app.contracts.epochs import Epochs
from app.contracts.proposals import Proposals
from app.controllers.snapshots import snapshot_finalized_epoch
from app.core.user import get_claimed_rewards
from tests.conftest import (
    allocate_user_rewards,
    MOCKED_CURRENT_EPOCH_NO,
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    MOCKED_PENDING_EPOCH_NO,
)

MOCKED_FINALIZED_EPOCH_NO = 42


@pytest.fixture(autouse=True)
def before(monkeypatch, proposal_accounts):
    mock_epochs = MagicMock(spec=Epochs)
    mock_proposals = MagicMock(spec=Proposals)
    mock_snapshotted = Mock()

    mock_proposals.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts
    ]
    mock_snapshotted.return_value = True
    mock_epochs.get_pending_epoch.return_value = MOCKED_PENDING_EPOCH_NO
    mock_epochs.get_current_epoch.return_value = MOCKED_CURRENT_EPOCH_NO
    mock_epochs.get_finalized_epoch.return_value = MOCKED_FINALIZED_EPOCH_NO

    monkeypatch.setattr(
        "app.core.allocations.has_pending_epoch_snapshot", mock_snapshotted
    )
    monkeypatch.setattr("app.core.allocations.proposals", mock_proposals)
    monkeypatch.setattr("app.core.allocations.epochs", mock_epochs)
    monkeypatch.setattr("app.controllers.snapshots.epochs", mock_epochs)
    monkeypatch.setattr("app.core.proposals.proposals", mock_proposals)


def test_finalized_epoch_snapshot_with_rewards(
    user_accounts, proposal_accounts, pending_epoch_snapshot
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
    user_accounts, proposal_accounts, pending_epoch_snapshot
):
    result = snapshot_finalized_epoch()
    assert result == 42

    rewards = database.rewards.get_by_epoch(result)
    assert len(rewards) == 0

    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(result)
    assert snapshot.total_withdrawals is None
    assert snapshot.withdrawals_merkle_root is None
    assert snapshot.created_at is not None
