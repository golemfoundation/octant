import pytest

from app.exceptions import RewardsException, EstimateRewardsNotSupported
from app.modules.common.validations.user_validations import (
    validate_estimate_budget_by_epochs_inputs,
    validate_if_given_epoch_has_previous_one,
)
from app.constants import GLM_TOTAL_SUPPLY_WEI


@pytest.mark.parametrize("no_epochs, glm_amount", [(0, 1000), (-1, 1000)])
def test_validate_estimate_budget_by_epochs_inputs_when_wrong_no_epochs(
    no_epochs, glm_amount
):
    with pytest.raises(RewardsException) as exc:
        validate_estimate_budget_by_epochs_inputs(no_epochs, glm_amount)

    assert (
        exc.value.message == "Number of epochs to estimate must be equal to at least 1."
    )
    assert exc.value.status_code == 400


@pytest.mark.parametrize(
    "no_epochs, glm_amount", [(1, -1000), (1, GLM_TOTAL_SUPPLY_WEI + 1)]
)
def test_validate_estimate_budget_by_epochs_inputs_when_wrong_glm_amount(
    no_epochs, glm_amount
):
    with pytest.raises(RewardsException) as exc:
        validate_estimate_budget_by_epochs_inputs(no_epochs, glm_amount)

    assert (
        exc.value.message == f"Glm amount must be between 0 and {GLM_TOTAL_SUPPLY_WEI}"
    )
    assert exc.value.status_code == 400


@pytest.mark.parametrize("epoch_num", [-1, -2, 0, 1])
def test_validate_if_given_epoch_has_previous_one_when_invalid_num(epoch_num: int):
    with pytest.raises(EstimateRewardsNotSupported) as exc:
        validate_if_given_epoch_has_previous_one(epoch_num)

    assert exc.value.description == "Estimating rewards is not supported for epoch 1"
    assert exc.value.code == 500
