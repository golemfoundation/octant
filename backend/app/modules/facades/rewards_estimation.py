from app.modules.user.allocations.controller import get_all_allocations_sum
from app.modules.user.rewards.controller import get_sum_of_claimed_rewards
from app.modules.facades.dto import EstimatedRewardsDTO
from app.modules.octant_rewards.controller import get_octant_rewards
from app.modules.user.budgets.controller import estimate_budget
from app.exceptions import EstimateRewardsNotSupported
from app.extensions import epochs


def estimate_rewards(lock_duration_sec: int, glm_amount: int) -> EstimatedRewardsDTO:
    """
    Facade used to estimate user rewards and matching fund rewards.
    """
    current_epoch_num = epochs.get_current_epoch()
    if current_epoch_num >= 2:
        epoch_num = current_epoch_num - 1
    else:
        raise EstimateRewardsNotSupported()

    allocations_sum = get_all_allocations_sum(epoch_num)
    claimed_rewards = get_sum_of_claimed_rewards(epoch_num)

    budget = estimate_budget(lock_duration_sec, glm_amount)

    ratio = (
        allocations_sum / claimed_rewards if claimed_rewards else 0
    )  # TBC calculate the ratio how much of the budget was claimed by users in previous epoch

    individual_rewards = get_octant_rewards(
        epoch_num
    ).individual_rewards  # TBC get whole pool of IR from previous epoch

    matching_fund = (
        budget + (individual_rewards - budget) * ratio
    )  # TBC we assume our user donates his whole reward and other users claims the same amount of budget as in previous epoch

    return EstimatedRewardsDTO(estimated_budget=budget, matching_fund=matching_fund)
