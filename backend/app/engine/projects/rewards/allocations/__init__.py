from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Tuple


@dataclass(frozen=True)
class AllocationItem:
    proposal_address: str
    amount: int


@dataclass
class ProjectAllocationsPayload:
    allocations: List[AllocationItem] = None


@dataclass
class ProjectAllocations(ABC):
    @abstractmethod
    def group_allocations_by_projects(
        self, payload: ProjectAllocationsPayload
    ) -> [List[Tuple[str, int]], int]:
        pass
