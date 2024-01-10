from typing import List, Tuple

from app.engine.user.budget import UserBudgetPayload, UserBudget
from app.engine.user.effective_deposit import UserDeposit
from app.modules.dto import OctantRewardsDTO


def calculate_user_budgets(
    budget_calculator: UserBudget,
    rewards: OctantRewardsDTO,
    user_deposits: List[UserDeposit],
) -> List[Tuple[str, int]]:
    budgets = []
    for address, effective_deposit, _ in user_deposits:
        user_budget = budget_calculator.calculate_budget(
            UserBudgetPayload(
                user_effective_deposit=effective_deposit,
                total_effective_deposit=rewards.total_effective_deposit,
                all_individual_rewards=rewards.individual_rewards,
            )
        )
        if user_budget:
            budgets.append((address, user_budget))

    return budgets
