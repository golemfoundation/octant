from dataclasses import dataclass


@dataclass
class UserBudgetPayload:
    user_effective_deposit: int = None
    total_effective_deposit: int = None
    all_individual_rewards: int = None

