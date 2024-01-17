from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple


@dataclass(frozen=True)
class AllocationPayload:
    proposal_address: str
    amount: int


@dataclass
class ProjectAllocationsPayload:
    allocations: List[AllocationPayload] = None


@dataclass
class ProjectAllocations(ABC):
    @abstractmethod
    def group_allocations_by_projects(
        self, payload: ProjectAllocationsPayload
    ) -> [List[Tuple[str, int]], int]:
        pass
