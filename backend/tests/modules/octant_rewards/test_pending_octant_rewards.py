from app.modules.octant_rewards.service.pending import PendingOctantRewards
from tests.conftest import ETH_PROCEEDS, TOTAL_ED
from tests.helpers.constants import (
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    OPERATIONAL_COST,
    LOCKED_RATIO,
)
from tests.helpers.context import get_context


def test_pending_octant_rewards(mock_pending_epoch_snapshot_db):
    context = get_context()
    service = PendingOctantRewards()

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
