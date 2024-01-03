import pytest

from app.engine.octant_rewards import OpCost20Percent
from app.engine.octant_rewards.operational_cost import OperationalCostPayload


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
    uut = OpCost20Percent()

    result = uut.calculate_operational_cost(payload)

    assert result == exp_op_cost
