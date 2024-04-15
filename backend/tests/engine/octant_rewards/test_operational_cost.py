from decimal import Decimal

import pytest
from app.engine.octant_rewards.operational_cost import OperationalCostPayload
from app.engine.octant_rewards.operational_cost.op_cost_percent import OpCostPercent


@pytest.mark.parametrize(
    "eth_proceeds,exp_op_cost",
    [
        (4_338473610_477382755, 867694722_095476551),
        (
            600_000000000_000000000,
            120_000000000_000000000,
        ),
        (10_000000000_000000000, 2_000000000_000000000),
        (
            1200_000000000_000000000,
            240_000000000_000000000,
        ),
    ],
)
def test_operational_cost_20percent(eth_proceeds, exp_op_cost):
    payload = OperationalCostPayload(eth_proceeds)
    uut = OpCostPercent(Decimal("0.20"))

    result = uut.calculate_operational_cost(payload)

    assert result == exp_op_cost


@pytest.mark.parametrize(
    "eth_proceeds,exp_op_cost",
    [
        (4_338473610_477382755, 1084618402_619345688),
        (
            600_000000000_000000000,
            150_000000000_000000000,
        ),
        (10_000000000_000000000, 2_500000000_000000000),
        (
            1200_000000000_000000000,
            300_000000000_000000000,
        ),
    ],
)
def test_operational_cost_25percent(eth_proceeds, exp_op_cost):
    payload = OperationalCostPayload(eth_proceeds)
    uut = OpCostPercent(Decimal("0.25"))

    result = uut.calculate_operational_cost(payload)

    assert result == exp_op_cost
