from decimal import Decimal

from app.engine.user.budget import UserBudgetPayload, UserBudget


class UserBudgetWithPPF(UserBudget):
    def calculate_budget(self, payload: UserBudgetPayload) -> int:
        if not payload.total_effective_deposit:
            return 0

        individual_share = Decimal(payload.user_effective_deposit) / Decimal(
            payload.total_effective_deposit
        )

        extra_individual_rewards = Decimal("0.5") * payload.ppf
        full_individual_rewards = (
            payload.vanilla_individual_rewards + extra_individual_rewards
        )

        calced_budget = int(individual_share * full_individual_rewards)

        return calced_budget
