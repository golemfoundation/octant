from app.modules.facades.dto import EstimatedRewardsDTO
from app.modules.octant_rewards import controller as octant_rewards_controller
from app.modules.user.budgets import controller as budget_controller


def estimate_rewards(
    last_epoch_num: int, no_epochs: int, glm_amount: int
) -> EstimatedRewardsDTO:
    """
    Facade used to estimate user rewards and matching fund rewards.
    Merges two domains: octant_rewards and user_budgets.
    """
    leverage = octant_rewards_controller.get_leverage(last_epoch_num)
    epochs_budget = budget_controller.estimate_epochs_budget(no_epochs, glm_amount)

    return EstimatedRewardsDTO(
        estimated_budget=epochs_budget, matching_fund=epochs_budget, leverage=leverage
    )
