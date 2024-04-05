from unittest.mock import Mock

from app.modules.dto import AllocationItem
from app.modules.octant_rewards.service.pending import PendingOctantRewards
from tests.helpers.constants import (
    USER1_BUDGET,
    MOCKED_EPOCH_NO_AFTER_OVERHAUL,
    COMMUNITY_FUND,
    PPF,
)
from tests.helpers import make_user_allocation
from tests.helpers.context import get_context
from tests.helpers.pending_snapshot import create_pending_snapshot
from tests.modules.octant_rewards.helpers.checker import check_octant_rewards


def test_pending_octant_rewards_before_overhaul(mock_pending_epoch_snapshot_db):
    context = get_context()
    service = PendingOctantRewards(patrons_mode=Mock())

    result = service.get_octant_rewards(context)

    check_octant_rewards(result)


def test_pending_octant_rewards_after_overhaul(
    mock_pending_epoch_snapshot_db_since_epoch3,
):
    context = get_context(epoch_num=MOCKED_EPOCH_NO_AFTER_OVERHAUL)
    service = PendingOctantRewards(patrons_mode=Mock())

    result = service.get_octant_rewards(context)

    check_octant_rewards(result, community_fund=COMMUNITY_FUND, ppf=PPF)


def test_pending_get_matched_rewards_with_patrons(
    mock_pending_epoch_snapshot_db, mock_patron_mode
):
    context = get_context()
    service = PendingOctantRewards(patrons_mode=mock_patron_mode)

    result = service.get_matched_rewards(context)

    assert result == 220_119996834_921768222


def test_pending_get_matched_rewards_without_patrons(
    mock_pending_epoch_snapshot_db, mock_patron_mode
):
    mock_patron_mode.get_patrons_rewards.return_value = 0
    context = get_context()
    service = PendingOctantRewards(patrons_mode=mock_patron_mode)

    result = service.get_matched_rewards(context)

    assert result == 220_114398315_501248407


def test_pending_get_matched_rewards_after_overhaul(mock_patron_mode, mock_users_db):
    create_pending_snapshot(
        epoch_nr=MOCKED_EPOCH_NO_AFTER_OVERHAUL, mock_users_db=mock_users_db
    )

    mock_patron_mode.get_patrons_rewards.return_value = 0
    context = get_context(3)
    service = PendingOctantRewards(patrons_mode=mock_patron_mode)

    result = service.get_matched_rewards(context)

    assert result == 181_084931506_849531232


def test_pending_get_leverage(
    proposal_accounts, mock_users_db, mock_pending_epoch_snapshot_db, mock_patron_mode
):
    user, _, _ = mock_users_db
    context = get_context()
    service = PendingOctantRewards(patrons_mode=mock_patron_mode)
    make_user_allocation(
        context,
        user,
        allocation_items=[AllocationItem(proposal_accounts[0].address, USER1_BUDGET)],
    )

    result = service.get_leverage(context)

    assert result == 144164.29856550877
