from decimal import Decimal

from app.engine.user.budget import UserBudgetPayload, UserBudget


class UserBudgetWithPPF(UserBudget):
    def calculate_budget(self, payload: UserBudgetPayload) -> int:
        if not payload.total_effective_deposit:
            return 0

        individual_share = Decimal(payload.user_effective_deposit) / Decimal(
            payload.total_effective_deposit
        )
        ppf_to_increase_budget = Decimal("0.5") * payload.ppf

        if payload.all_individual_rewards > ppf_to_increase_budget:
            return int(payload.all_individual_rewards * individual_share)

        return int(ppf_to_increase_budget * individual_share)
