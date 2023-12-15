from unittest.mock import Mock

import pytest

from app.v2.context.context import ContextBuilder
from app.v2.modules.user.deposits.service import UserDepositsEstimator


@pytest.fixture(autouse=True)
def before(app, patch_epochs, mock_epoch_details):
    pass


@pytest.fixture(scope="function")
def user_deposits_calculator_mock():
    user_deposits_calculator_mock = Mock()
    user_deposits_calculator_mock.calculate_effective_deposits.return_value = (
        [],
        3060_000000000_000000000,
    )
    return user_deposits_calculator_mock


def test_get_budgets_in_pending_epoch(user_deposits_calculator_mock):
    context = ContextBuilder().with_current_epoch_context().build()

    service = UserDepositsEstimator(user_deposits_calculator_mock)
    result = service.estimate_total_effective_deposit(context.current_epoch_context)

    assert result == 3060_000000000_000000000
