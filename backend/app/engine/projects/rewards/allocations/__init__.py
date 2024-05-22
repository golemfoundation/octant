from abc import ABC, abstractmethod
from dataclasses import dataclass
from itertools import groupby
from numbers import Number
from typing import List, Dict


@dataclass(frozen=True)
class AllocationItem:
    project_address: str
    amount: int


@dataclass
class ProjectAllocationsPayload:
    allocations: List[AllocationItem] = None


@dataclass
class ProjectAllocations(ABC):
    @abstractmethod
    def _calc_allocations(self, allocations: List[AllocationItem]) -> Number:
        ...

    def group_allocations_by_projects(
        self, payload: ProjectAllocationsPayload
    ) -> (Dict[str, int], Number):
        result_allocations = {}
        total_allocated = 0
        grouped_allocations = groupby(
            sorted(payload.allocations, key=lambda a: a.project_address),
            key=lambda a: a.project_address,
        )
        for project_address, project_allocations in grouped_allocations:
            project_allocations = self._calc_allocations(project_allocations)
            result_allocations.update({project_address, project_allocations})
            total_allocated += project_allocations

        return result_allocations, total_allocated
