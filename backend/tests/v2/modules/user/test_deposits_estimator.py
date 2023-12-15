from unittest.mock import Mock

import pytest

from app.v2.context.context import ContextBuilder
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.deposits.service import UserDepositsEstimator
from tests.conftest import USER1_ADDRESS


@pytest.fixture(autouse=True)
def before(app, patch_epochs, mock_epoch_details):
    pass


@pytest.fixture(scope="function")
def user_deposits_calculator_mock():
    user_deposits_calculator_mock = Mock()
    user_deposits_calculator_mock.calculate_all_effective_deposits.return_value = (
        [UserDeposit(USER1_ADDRESS, 250_000000000_000000000, 300_000000000_000000000)],
        3060_000000000_000000000,
    )
    user_deposits_calculator_mock.calculate_effective_deposit.return_value = (
        UserDeposit(USER1_ADDRESS, 250_000000000_000000000, 300_000000000_000000000)
    )
    return user_deposits_calculator_mock


def test_estimate_total_effective_deposit_in_current_epoch(
    user_deposits_calculator_mock,
):
    context = ContextBuilder().with_current_epoch_context().build()

    service = UserDepositsEstimator(user_deposits_calculator_mock)
    result = service.estimate_total_effective_deposit(context.current_epoch_context)

    assert result == 3060_000000000_000000000


def test_estimate_user_effective_deposit_in_current_epoch(
    user_deposits_calculator_mock,
):
    context = ContextBuilder().with_current_epoch_context().build()

    service = UserDepositsEstimator(user_deposits_calculator_mock)
    result = service.estimate_user_effective_deposit(
        context.current_epoch_context, USER1_ADDRESS
    )

    assert result == 250_000000000_000000000
