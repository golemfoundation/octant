from typing import List

from app.v2.engine.user.budget import UserBudgetPayload, UserBudget
from app.v2.engine.user.effective_deposit import UserDeposit


def calculate_budgets(
    budget_calculator: UserBudget,
    user_deposits: List[UserDeposit],
    total_effective_deposits: int,
    individual_rewards: int,
):
    budgets = []
    for address, effective_deposit, _ in user_deposits:
        user_budget = budget_calculator.calculate_budget(
            UserBudgetPayload(
                user_effective_deposit=effective_deposit,
                total_effective_deposit=total_effective_deposits,
                all_individual_rewards=individual_rewards,
            )
        )
        budgets.append((address, user_budget))

    return budgets
