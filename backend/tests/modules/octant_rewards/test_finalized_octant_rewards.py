from app.infrastructure import database
from app.modules.dto import AllocationDTO, OctantRewardsDTO
from app.modules.octant_rewards.service.finalized import FinalizedOctantRewards
from tests.conftest import ETH_PROCEEDS, TOTAL_ED
from tests.helpers.constants import (
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    OPERATIONAL_COST,
    LOCKED_RATIO,
    TOTAL_WITHDRAWALS,
    MATCHED_REWARDS,
    LEFTOVER,
    USER1_BUDGET,
    COMMUNITY_FUND,
    PPF,
)
from tests.helpers.context import get_context


def test_finalized_octant_rewards_before_overhaul(
    mock_pending_epoch_snapshot_db, mock_finalized_epoch_snapshot_db
):
    context = get_context()
    service = FinalizedOctantRewards()

    result = service.get_octant_rewards(context)

    _check_octant_rewards(result)


def test_finalized_octant_rewards_after_overhaul(
    mock_pending_epoch_snapshot_db_since_epoch3, mock_finalized_epoch_snapshot_db
):
    context = get_context(epoch_num=3)
    service = FinalizedOctantRewards()

    result = service.get_octant_rewards(context)

    _check_octant_rewards(result, ppf=PPF, community_fund=COMMUNITY_FUND)


def test_finalized_get_leverage(
    proposal_accounts, mock_users_db, mock_finalized_epoch_snapshot_db
):
    user, _, _ = mock_users_db
    database.allocations.add_all(
        1,
        user.id,
        0,
        [AllocationDTO(proposal_accounts[0].address, USER1_BUDGET)],
    )
    context = get_context()
    service = FinalizedOctantRewards()

    result = service.get_leverage(context)

    assert result == 144160.63189897747


def _check_octant_rewards(rewards: OctantRewardsDTO, ppf=None, community_fund=None):
    assert rewards.staking_proceeds == ETH_PROCEEDS
    assert rewards.locked_ratio == LOCKED_RATIO
    assert rewards.total_effective_deposit == TOTAL_ED
    assert rewards.total_rewards == TOTAL_REWARDS
    assert rewards.individual_rewards == ALL_INDIVIDUAL_REWARDS
    assert rewards.operational_cost == OPERATIONAL_COST
    assert rewards.patrons_rewards == 0
    assert rewards.total_withdrawals == TOTAL_WITHDRAWALS
    assert rewards.matched_rewards == MATCHED_REWARDS
    assert rewards.leftover == LEFTOVER
    assert rewards.community_fund == community_fund
    assert rewards.ppf == ppf
