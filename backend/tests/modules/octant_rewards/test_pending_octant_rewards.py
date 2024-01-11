from app.infrastructure import database
from app.modules.dto import AllocationDTO
from app.modules.octant_rewards.service.pending import PendingOctantRewards
from tests.conftest import ETH_PROCEEDS, TOTAL_ED
from tests.helpers.constants import (
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    OPERATIONAL_COST,
    LOCKED_RATIO,
    USER1_BUDGET,
)
from tests.helpers.context import get_context


def test_pending_octant_rewards(mock_pending_epoch_snapshot_db):
    context = get_context()
    service = PendingOctantRewards(None)

    result = service.get_octant_rewards(context)

    assert result.staking_proceeds == ETH_PROCEEDS
    assert result.locked_ratio == LOCKED_RATIO
    assert result.total_effective_deposit == TOTAL_ED
    assert result.total_rewards == TOTAL_REWARDS
    assert result.individual_rewards == ALL_INDIVIDUAL_REWARDS
    assert result.operational_cost == OPERATIONAL_COST
    assert result.patrons_rewards is None
    assert result.total_withdrawals is None
    assert result.matched_rewards is None
    assert result.leftover is None


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


def test_pending_get_leverage(
    proposal_accounts, mock_users_db, mock_pending_epoch_snapshot_db, mock_patron_mode
):
    user, _, _ = mock_users_db
    database.allocations.add_all(
        1,
        user.id,
        0,
        [AllocationDTO(proposal_accounts[0].address, USER1_BUDGET)],
    )
    context = get_context()
    service = PendingOctantRewards(patrons_mode=mock_patron_mode)

    result = service.get_leverage(context)

    assert result == 144164.29856550877
