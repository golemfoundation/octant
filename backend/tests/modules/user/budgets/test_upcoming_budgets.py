import pytest

from app.modules.snapshots.pending.service.simulated import SimulatedPendingSnapshots
from app.modules.user.budgets.service.upcoming import UpcomingUserBudgets
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_budget(alice, mock_octant_rewards, mock_user_deposits):
    context = get_context(3)

    simulated_pending_snapshot = SimulatedPendingSnapshots(
        effective_deposits=mock_user_deposits, octant_rewards=mock_octant_rewards
    )
    service = UpcomingUserBudgets(
        simulated_pending_snapshot_service=simulated_pending_snapshot
    )

    result = service.get_budget(context, alice.address)

    assert result == 327514230242439
