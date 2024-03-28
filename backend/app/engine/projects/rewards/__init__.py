from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List

from dataclass_wizard import JSONWizard

from app.engine.projects.rewards.allocations import AllocationItem


@dataclass
class ProjectRewardDTO(JSONWizard):
    address: str
    allocated: int
    matched: int

    @property
    def amount(self):
        return self.allocated + self.matched

    def __iter__(self):
        yield self.address
        yield self.allocated
        yield self.matched


@dataclass
class ProjectRewardsPayload:
    matched_rewards: int = None
    allocations: List[AllocationItem] = None
    projects: List[str] = None


@dataclass
class ProjectRewardsResult:
    rewards: List[ProjectRewardDTO]
    rewards_sum: int
    total_allocated: int
    threshold: int


@dataclass
class ProjectRewards(ABC):
    @abstractmethod
    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> ProjectRewardsResult:
        pass

    @abstractmethod
    def calculate_threshold(self, total_allocated: int, projects: list[str]) -> int:
        pass
