from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple

from app.core.common import AccountFunds


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
