from decimal import Decimal

import pytest

from app.modules.snapshots.pending.service.simulated import (
    SimulatedPendingSnapshots,
)
from tests.helpers.constants import (
    USER2_ADDRESS,
    USER1_ADDRESS,
    ETH_PROCEEDS,
    PPF,
    COMMUNITY_FUND,
)
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_simulated_pending_snapshots(
    alice, bob, mock_octant_rewards, mock_user_deposits
):
    context = get_context(1)

    service = SimulatedPendingSnapshots(
        effective_deposits=mock_user_deposits, octant_rewards=mock_octant_rewards
    )

    result = service.simulate_pending_epoch_snapshot(context)

    rewards = result.rewards

    assert rewards.staking_proceeds == ETH_PROCEEDS
    assert rewards.locked_ratio == Decimal("0.100022700000000000099999994")
    assert rewards.total_rewards == 321928767123288031232
    assert rewards.vanilla_individual_rewards == 101814368807786782825
    assert rewards.total_effective_deposit == 100022700000000000099999994
    assert rewards.operational_cost == 80482191780822000000
    assert rewards.ppf == PPF
    assert rewards.community_fund == COMMUNITY_FUND

    user_budgets = result.user_budgets
    assert len(user_budgets) == 2
    assert user_budgets[0].user_address == USER1_ADDRESS
    assert user_budgets[1].user_address == USER2_ADDRESS
    assert user_budgets[0].budget == 274836407916427
    assert user_budgets[1].budget == 2839976215136415

    user_deposits = result.user_deposits
    assert len(user_deposits) == 2
    assert user_deposits[0].user_address == USER1_ADDRESS
    assert user_deposits[0].effective_deposit == 270000000000000000000
    assert user_deposits[0].deposit == 300000000000000000000
    assert user_deposits[1].user_address == USER2_ADDRESS
    assert user_deposits[1].effective_deposit == 2790000000000000000000
    assert user_deposits[1].deposit == 3100000000000000000000
