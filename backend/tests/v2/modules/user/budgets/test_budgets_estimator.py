from unittest.mock import Mock

import pytest

from app.v2.modules.user.budgets.service import UserBudgetsEstimator
from tests.helpers.context import get_epoch_context, get_context


def test_estimate_budget_effective_deposit_is_zero():
    user_deposits_estimator_mock = Mock()
    user_deposits_estimator_mock.estimate_effective_deposit.return_value = 0

    current_context = get_epoch_context(2)
    future_context = get_epoch_context(3)
    context = get_context(
        current_epoch_context=current_context, future_epoch_context=future_context
    )

    service = UserBudgetsEstimator(user_deposits_estimator_mock)

    result = service.estimate_budget(context, 500, 0)

    assert result == 0


@pytest.mark.parametrize(
    "lock_duration,expected",
    [
        (400, 508956_310956346),
        (600, 763434_466434519),
        (1750, 1781347_088347212),
        (2750, 2799259_710259905),
    ],
)
def test_estimate_budget(lock_duration, expected):
    mock_responses = [
        500_000000000_000000000,
        1000_000000000_000000000,
        250_000000000_000000000,
    ]
    user_deposits_estimator_mock = Mock()
    user_deposits_estimator_mock.estimate_effective_deposit.side_effect = mock_responses

    current_context = get_epoch_context(2, remaining_sec=500)
    future_context = get_epoch_context(3, remaining_sec=1000)
    context = get_context(
        current_epoch_context=current_context, future_epoch_context=future_context
    )

    service = UserBudgetsEstimator(user_deposits_estimator_mock)

    result = service.estimate_budget(context, lock_duration, 500_000000000_000000000)

    assert result == expected
