import pytest

from app.utils.time import days_to_sec
from app.v2.modules.user.budgets.service.service import estimate_budget
from tests.helpers.context import get_context


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
    current_context = get_context(1, start=10000000, duration=6220800, remaining_sec=6000000)
    future_context = get_context(2, start=16220800, duration=7776000, remaining_sec=7776000)
    lock_duration = days_to_sec(days)

    result = estimate_budget(current_context, future_context, lock_duration, amount)

    assert result == expected
