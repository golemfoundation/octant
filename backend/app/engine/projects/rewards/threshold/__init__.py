from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Dict

from app.engine.projects.rewards import AllocationsBelowThreshold
from app.engine.projects.rewards import AllocationItem


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
        self, allocations: Dict[str, List[AllocationItem]]
    ) -> AllocationsBelowThreshold:
        pass
