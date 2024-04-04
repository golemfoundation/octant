from unittest.mock import Mock

import pytest

from app.infrastructure import database
from app.modules.dto import AllocationItem
from app.modules.snapshots.finalized.service.finalizing import FinalizingSnapshots
from tests.helpers import make_user_allocation
from tests.helpers.constants import MATCHED_REWARDS, USER2_BUDGET
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_create_finalized_snapshots_with_rewards(
    mock_users_db, mock_octant_rewards, mock_patron_mode, mock_user_rewards
):
    context = get_context(1)
    projects = context.projects_details.projects
    make_user_allocation(
        context, mock_users_db[2], allocation_items=[AllocationItem(projects[0], 100)]
    )

    service = FinalizingSnapshots(
        patrons_mode=mock_patron_mode,
        octant_rewards=mock_octant_rewards,
        user_rewards=mock_user_rewards,
    )

    result = service.create_finalized_epoch_snapshot(context)

    assert result == 1
    rewards = database.rewards.get_by_epoch(result)
    assert rewards[0].address == mock_users_db[1].address
    assert rewards[0].amount == str(200_000000000)
    assert rewards[0].matched is None
    assert rewards[1].address == projects[0]
    assert rewards[1].amount == str(MATCHED_REWARDS + 100)
    assert rewards[1].matched == str(MATCHED_REWARDS)
    assert rewards[2].address == mock_users_db[0].address
    assert rewards[2].amount == str(100_000000000)
    assert rewards[2].matched is None

    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(result)
    assert snapshot.matched_rewards == str(MATCHED_REWARDS)
    assert snapshot.total_withdrawals == str(MATCHED_REWARDS + 100 + 300_000000000)
    assert snapshot.patrons_rewards == str(USER2_BUDGET)
    assert snapshot.leftover == str(101_814368507_786751493)
    assert (
        snapshot.withdrawals_merkle_root
        == "0xe3cd8746f9df50db5c4cbc1962f3dcb0db4236bb06960593d36444a86e296b3c"
    )


def test_create_finalized_snapshots_without_rewards(
    mock_users_db, mock_octant_rewards, mock_patron_mode, mock_user_rewards
):
    context = get_context(1)
    mock_user_rewards = Mock()
    mock_user_rewards.get_claimed_rewards.return_value = [], 0

    service = FinalizingSnapshots(
        patrons_mode=mock_patron_mode,
        octant_rewards=mock_octant_rewards,
        user_rewards=mock_user_rewards,
    )

    result = service.create_finalized_epoch_snapshot(context)

    assert result == 1
    rewards = database.rewards.get_by_epoch(result)
    assert rewards == []

    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(result)
    assert snapshot.matched_rewards == str(MATCHED_REWARDS)
    assert snapshot.total_withdrawals == str(0)
    assert snapshot.leftover == str(321_928767123_288000000)
    assert snapshot.withdrawals_merkle_root is None
