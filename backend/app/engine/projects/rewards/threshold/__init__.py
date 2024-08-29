from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List

from app.engine.projects.rewards import AllocationItem, AllocationsBelowThreshold


@dataclass
class ProjectThresholdPayload:
    total_allocated: int = None
    projects_count: int = None


@dataclass
class ProjectThreshold(ABC):
    @abstractmethod
    def calculate_threshold(self, payload: ProjectThresholdPayload) -> int:
        pass

    @abstractmethod
    def get_total_allocations_below_threshold(
        self, allocations: List[AllocationItem], no_projects: int
    ) -> AllocationsBelowThreshold:
        pass
