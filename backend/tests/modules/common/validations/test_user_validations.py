import pytest

from app import exceptions
from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.modules.common.validations.user_validations import (
    validate_estimate_budget_inputs,
    MAX_DAYS_TO_ESTIMATE_BUDGET,
)


def test_estimate_budget_validates_inputs():
    with pytest.raises(exceptions.RewardsException):
        validate_estimate_budget_inputs(-1, 1000)

    with pytest.raises(exceptions.RewardsException):
        validate_estimate_budget_inputs(MAX_DAYS_TO_ESTIMATE_BUDGET + 1, 1000)

    with pytest.raises(exceptions.RewardsException):
        validate_estimate_budget_inputs(100, -1)

    with pytest.raises(exceptions.RewardsException):
        validate_estimate_budget_inputs(100, GLM_TOTAL_SUPPLY_WEI + 1)
