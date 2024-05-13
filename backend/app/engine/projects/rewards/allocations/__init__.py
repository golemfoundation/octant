from abc import ABC, abstractmethod
from dataclasses import dataclass
from itertools import groupby
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
    def _sum_allocations(self, allocations: List[AllocationItem]) -> int:
        pass

    def group_allocations_by_projects(
        self, payload: ProjectAllocationsPayload
    ) -> [List[Tuple[str, int]], int]:
        result_allocations = []
        total_allocated = 0
        grouped_allocations = groupby(
            sorted(payload.allocations, key=lambda a: a.proposal_address),
            key=lambda a: a.proposal_address,
        )
        for project_address, project_allocations in grouped_allocations:
            self._sum_allocations(project_allocations)
            result_allocations.append((project_address, project_allocations))
            total_allocated += project_allocations

        return result_allocations, total_allocated
