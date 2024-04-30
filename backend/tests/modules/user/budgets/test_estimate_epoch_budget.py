import pytest

from app.modules.user.budgets.core import estimate_epoch_budget
from tests.helpers.context import get_context
from tests.helpers.octant_rewards import octant_rewards


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.mark.parametrize(
    "glm_amount,expected",
    [
        (90, 0),
        (1000_000000000_000000000, 1017912621912693),
        (300000_000000000_000000000, 305373786573808093),
    ],
)
def test_estimate_epoch_budget(glm_amount, expected):
    future_context = get_context(
        2, start=16220800, duration=7776000, remaining_sec=7776000
    )
    epoch_duration = future_context.epoch_details.duration_sec

    result = estimate_epoch_budget(
        future_context,
        octant_rewards(),
        epoch_duration,
        glm_amount,
    )

    assert result == expected
