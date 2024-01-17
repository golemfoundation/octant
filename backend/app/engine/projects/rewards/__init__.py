from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List

from dataclass_wizard import JSONWizard

from app.engine.projects.rewards.allocations import AllocationPayload


@dataclass
class ProjectRewardDTO(JSONWizard):
    address: str
    allocated: int
    matched: int

    def __iter__(self):
        yield self.address
        yield self.allocated
        yield self.matched


@dataclass
class ProjectRewardsPayload:
    matched_rewards: int = None
    allocations: List[AllocationPayload] = None
    projects: List[str] = None


@dataclass
class ProjectRewards(ABC):
    @abstractmethod
    def calculate_project_rewards(
        self, payload: ProjectRewardsPayload
    ) -> (List[ProjectRewardDTO], int, int):
        pass
