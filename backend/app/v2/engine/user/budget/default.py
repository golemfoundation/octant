from decimal import Decimal


class DefaultUserBudget:
    def calculate_budget(
        self,
        user_effective_deposit: int,
        total_effective_deposit: int,
        all_individual_rewards: int,
    ):
        individual_share = Decimal(user_effective_deposit) / Decimal(
            total_effective_deposit
        )

        return int(Decimal(all_individual_rewards) * individual_share)
