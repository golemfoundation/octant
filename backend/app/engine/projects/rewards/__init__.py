from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class AccountFunds(JSONWizard):
    address: str
    amount: int
    matched: int = None

    def __iter__(self):
        yield self.address
        yield self.amount
        yield self.matched


@dataclass
class ProjectRewardsPayload:
    matched_rewards: int = None
    allocated_by_addr: List[Tuple[str, int]] = None
    threshold: int = None


@dataclass
class ProjectRewards(ABC):
    @abstractmethod
    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> (List[AccountFunds], int):
        pass
