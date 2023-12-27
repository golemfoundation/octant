import pytest

from app.v2.modules.user.budgets.service.service import estimate_budget
from tests.helpers.context import get_context


@pytest.mark.parametrize(
    "lock_duration,amount,expected",
    [
        (400, 500_000000000_000000000, 508956_310956346),
        (600, 500_000000000_000000000, 763434_466434519),
        (1750, 500_000000000_000000000, 1781347_088347212),
        (2750, 500_000000000_000000000, 2799259_710259905),
    ],
)
def test_estimate_budget(lock_duration, amount, expected):
    current_context = get_context(2, remaining_sec=500)
    future_context = get_context(3, remaining_sec=1000)

    result = estimate_budget(current_context, future_context, lock_duration, amount)

    assert result == expected
