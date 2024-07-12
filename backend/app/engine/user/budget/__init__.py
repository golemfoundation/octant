from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class UserBudgetPayload:
    user_effective_deposit: int = None
    total_effective_deposit: int = None
    vanilla_individual_rewards: int = None
    ppf: Optional[int] = None


@dataclass
class UserBudget(ABC):
    @abstractmethod
    def calculate_budget(self, payload: UserBudgetPayload) -> int:
        pass
