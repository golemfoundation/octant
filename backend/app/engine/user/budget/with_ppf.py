from decimal import Decimal

from app.engine.user.budget import UserBudgetPayload, UserBudget


class UserBudgetWithPPF(UserBudget):
    def calculate_budget(self, payload: UserBudgetPayload) -> int:
        if not payload.total_effective_deposit:
            return 0

        individual_share = Decimal(payload.user_effective_deposit) / Decimal(
            payload.total_effective_deposit
        )

        calced_budget = int(
            payload.all_individual_rewards * individual_share
            + individual_share
            * (Decimal("0.5") * payload.ppf - payload.all_individual_rewards)
        )
        return calced_budget
