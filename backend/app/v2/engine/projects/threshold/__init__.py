from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ProjectThresholdPayload:
    total_allocated: int = None
    proposals_count: int = None


class ProjectThreshold(ABC):
    @abstractmethod
    def calculate_threshold(self, payload: ProjectThresholdPayload) -> int:
        pass
