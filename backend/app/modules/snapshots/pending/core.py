from typing import List

from app.engine.user.budget import UserBudgetPayload, UserBudget
from app.engine.user.effective_deposit import UserDeposit
from app.modules.dto import OctantRewardsDTO
from app.modules.snapshots.pending import UserBudgetInfo


def calculate_user_budgets(
    budget_calculator: UserBudget,
    rewards: OctantRewardsDTO,
    user_deposits: List[UserDeposit],
) -> List[UserBudgetInfo]:
    budgets = []
    for address, effective_deposit, _ in user_deposits:
        user_budget = budget_calculator.calculate_budget(
            UserBudgetPayload(
                user_effective_deposit=effective_deposit,
                total_effective_deposit=rewards.total_effective_deposit,
                vanilla_individual_rewards=rewards.vanilla_individual_rewards,
                ppf=rewards.ppf,
            )
        )
        if user_budget:
            budgets.append(UserBudgetInfo(address, user_budget))

    return budgets
