import pytest

from app.modules.common.time import days_to_sec
from app.modules.user.budgets.core import estimate_budget
from tests.helpers.context import get_context
from tests.helpers.octant_rewards import octant_rewards


@pytest.mark.parametrize(
    "days,amount,expected",
    [
        (0, 0, 0),
        (15, 90, 0),
        (15, 1000_000000000_000000000, 0),
        (15, 300000_000000000_000000000, 0),
        (70, 90_000000000_000000000, 0),
        (70, 1000_000000000_000000000, 981783_007246039),
        (70, 300000_000000000_000000000, 294534902_173811818),
        (150, 90_000000000_000000000, 0),
        (150, 1000_000000000_000000000, 981783_007246039),
        (150, 300000_000000000_000000000, 294534902_173811818),
        (252, 90_000000000_000000000, 0),
        (252, 1000_000000000_000000000, 3017608_251071425),
        (252, 300000_000000000_000000000, 905282475_321428004),
        (365250, 300000_000000000_000000000, 1239_195987032_113245119),
    ],
)
def test_estimate_budget(days, amount, expected):
    current_context = get_context(
        1, start=10000000, duration=6220800, remaining_sec=6000000
    )
    future_context = get_context(
        2, start=16220800, duration=7776000, remaining_sec=7776000
    )
    lock_duration = days_to_sec(days)

    result = estimate_budget(
        current_context,
        future_context,
        octant_rewards(),
        octant_rewards(),
        lock_duration,
        amount,
    )

    assert result == expected


@pytest.mark.parametrize(
    "days,amount,expected",
    [
        (0, 0, 0),
        (15, 90, 0),
        (15, 1000_000000000_000000000, 0),
        (15, 300000_000000000_000000000, 0),
        (70, 90_000000000_000000000, 0),
        (70, 1000_000000000_000000000, 981783_007246039),
        (70, 300000_000000000_000000000, 294534902_173811818),
        (150, 90_000000000_000000000, 0),
        (150, 1000_000000000_000000000, 981783_007246039),
        (150, 300000_000000000_000000000, 294534902_173811818),
        (252, 90_000000000_000000000, 0),
        (252, 1000_000000000_000000000, 2389901720462523),
        (252, 300000_000000000_000000000, 716970516138757278),
        (365250, 300000_000000000_000000000, 857205177830065677428),
    ],
)
def test_estimate_budget_for_new_strategy(days, amount, expected):
    """
    Test verifies the behaviour of estimating user_budget for the overhaul from Epoch 3.
    """
    current_context = get_context(
        2, start=10000000, duration=6220800, remaining_sec=6000000
    )
    future_context = get_context(
        3, start=16220800, duration=7776000, remaining_sec=7776000
    )
    lock_duration = days_to_sec(days)

    result = estimate_budget(
        current_context,
        future_context,
        octant_rewards(),
        octant_rewards(),
        lock_duration,
        amount,
    )

    assert result == expected
