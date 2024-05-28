from decimal import Decimal

from app.engine.user.budget import UserBudgetPayload, UserBudget


class PreliminaryUserBudget(UserBudget):
    def calculate_budget(self, payload: UserBudgetPayload) -> int:
        if not payload.total_effective_deposit:
            return 0

        individual_share = Decimal(payload.user_effective_deposit) / Decimal(
            payload.total_effective_deposit
        )

        return int(payload.vanilla_individual_rewards * individual_share)
