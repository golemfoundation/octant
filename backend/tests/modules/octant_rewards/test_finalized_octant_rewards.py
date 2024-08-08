from app.modules.dto import AllocationItem
from app.modules.octant_rewards.general.service.finalized import FinalizedOctantRewards

from tests.helpers import make_user_allocation
from tests.helpers.constants import (
    USER1_BUDGET,
    COMMUNITY_FUND,
    PPF,
    MOCKED_EPOCH_NO_AFTER_OVERHAUL,
    LEFTOVER,
    TOTAL_WITHDRAWALS,
    MATCHED_REWARDS,
    NO_PATRONS_REWARDS,
    MATCHED_REWARDS_AFTER_OVERHAUL,
)
from tests.helpers.context import get_context
from tests.modules.octant_rewards.helpers.checker import check_octant_rewards


def test_finalized_octant_rewards_before_overhaul(
    mock_pending_epoch_snapshot_db, mock_finalized_epoch_snapshot_db
):
    context = get_context()
    service = FinalizedOctantRewards()

    result = service.get_octant_rewards(context)

    check_octant_rewards(
        result,
        leftover=LEFTOVER,
        matched_rewards=MATCHED_REWARDS,
        total_withdrawals=TOTAL_WITHDRAWALS,
        patrons_rewards=NO_PATRONS_REWARDS,
        donated_to_projects=MATCHED_REWARDS,
    )


def test_finalized_octant_rewards_after_overhaul(
    mock_pending_epoch_snapshot_db_since_epoch3,
    mock_finalized_epoch_snapshot_db_since_epoch3,
):
    context = get_context(epoch_num=MOCKED_EPOCH_NO_AFTER_OVERHAUL)
    service = FinalizedOctantRewards()

    result = service.get_octant_rewards(context)

    check_octant_rewards(
        result,
        ppf=PPF,
        community_fund=COMMUNITY_FUND,
        leftover=LEFTOVER,
        matched_rewards=MATCHED_REWARDS_AFTER_OVERHAUL,
        total_withdrawals=TOTAL_WITHDRAWALS,
        patrons_rewards=NO_PATRONS_REWARDS,
        donated_to_projects=MATCHED_REWARDS_AFTER_OVERHAUL,
    )


def test_finalized_get_leverage(
    project_accounts, mock_users_db, mock_finalized_epoch_snapshot_db
):
    user, _, _ = mock_users_db
    context = get_context()
    make_user_allocation(
        context,
        user,
        allocation_items=[AllocationItem(project_accounts[0].address, USER1_BUDGET)],
    )

    service = FinalizedOctantRewards()

    result = service.get_leverage(context)

    assert result == 144160.63189897747


def test_donated_to_projects_in_octant_rewards_for_capped_mr(
    mock_pending_epoch_snapshot_with_uq_scores, mock_finalized_epoch_snapshot_db_for_e4
):
    context = get_context(epoch_num=4)
    service = FinalizedOctantRewards()
    result = service.get_octant_rewards(context)

    assert result.donated_to_projects == 140849434135859019815
