from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional

from dataclass_wizard import JSONWizard

from app.engine.projects.rewards.allocations import AllocationItem, ProjectAllocations
from app.engine.projects.rewards.leverage import Leverage


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
    before_allocations: List[AllocationItem] = None
    projects: List[str] = None
    user_new_allocations: List[AllocationItem] = field(default_factory=list)


@dataclass
class ProjectRewardsResult:
    rewards: List[ProjectRewardDTO]
    rewards_sum: int
    total_allocated: int
    leverage: float
    threshold: Optional[int] = None


@dataclass
class ProjectRewards(ABC):
    projects_allocations: ProjectAllocations = field(init=False)
    leverage: Leverage = field(init=False)

    @abstractmethod
    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> ProjectRewardsResult:
        pass

    def calculate_threshold(self, total_allocated: int, projects: List[str]) -> None:
        return None
