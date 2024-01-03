from app.modules.octant_rewards.service.impl.finalized import FinalizedOctantRewards
from tests.conftest import ETH_PROCEEDS, TOTAL_ED
from tests.helpers.constants import (
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    OPERATIONAL_COST,
    LOCKED_RATIO,
    TOTAL_WITHDRAWALS,
    MATCHED_REWARDS,
    LEFTOVER,
)
from tests.helpers.context import get_context


def test_finalized_octant_rewards(
    mock_pending_epoch_snapshot_db, mock_finalized_epoch_snapshot_db
):
    context = get_context()
    service = FinalizedOctantRewards()

    result = service.get_octant_rewards(context)

    assert result.staking_proceeds == ETH_PROCEEDS
    assert result.locked_ratio == LOCKED_RATIO
    assert result.total_effective_deposit == TOTAL_ED
    assert result.total_rewards == TOTAL_REWARDS
    assert result.individual_rewards == ALL_INDIVIDUAL_REWARDS
    assert result.operational_cost == OPERATIONAL_COST
    assert result.patrons_rewards == 0
    assert result.total_withdrawals == TOTAL_WITHDRAWALS
    assert result.matched_rewards == MATCHED_REWARDS
    assert result.leftover == LEFTOVER
