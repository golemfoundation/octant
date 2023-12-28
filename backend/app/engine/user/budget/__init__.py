from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class UserBudgetPayload:
    user_effective_deposit: int = None
    total_effective_deposit: int = None
    all_individual_rewards: int = None


@dataclass
class UserBudget(ABC):
    @abstractmethod
    def calculate_budget(self, payload: UserBudgetPayload) -> int:
        pass
