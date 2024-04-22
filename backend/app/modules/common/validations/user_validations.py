from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.exceptions import RewardsException, EstimateRewardsNotSupported

MAX_DAYS_TO_ESTIMATE_BUDGET = 365250


def validate_estimate_budget_inputs(days: int, glm_amount: int):
    if days < 0 or days > MAX_DAYS_TO_ESTIMATE_BUDGET:
        raise RewardsException(
            f"Time to estimate must be between 0 and {MAX_DAYS_TO_ESTIMATE_BUDGET} days",
            400,
        )
    if glm_amount < 0 or glm_amount > GLM_TOTAL_SUPPLY_WEI:
        raise RewardsException(
            f"Glm amount must be between 0 and {GLM_TOTAL_SUPPLY_WEI}", 400
        )


def validate_estimate_budget_by_epochs_inputs(no_epochs: int, glm_amount: int):
    if no_epochs <= 0:
        raise RewardsException(
            "Number of epochs to estimate must be equal to at least 1.",
            400,
        )
    if glm_amount < 0 or glm_amount > GLM_TOTAL_SUPPLY_WEI:
        raise RewardsException(
            f"Glm amount must be between 0 and {GLM_TOTAL_SUPPLY_WEI}", 400
        )


def validate_if_given_epoch_has_previous_one(epoch_num: int):
    if epoch_num <= 1:
        raise EstimateRewardsNotSupported()
