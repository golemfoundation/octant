from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal
from itertools import groupby
from typing import List, Optional, Tuple

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class AllocationItem:
    project_address: str
    amount: int
    uq_score: Optional[Decimal] = None


@dataclass(frozen=True)
class ProjectSumAllocationsDTO(JSONWizard):
    project_address: str
    amount: int


@dataclass
class ProjectAllocationsPayload:
    allocations: List[AllocationItem] = None


@dataclass
class ProjectAllocations(ABC):
    @abstractmethod
    def _calc_allocations(self, allocations: List[AllocationItem]) -> int:
        ...

    def group_allocations_by_projects(
        self, payload: ProjectAllocationsPayload
    ) -> Tuple[List[ProjectSumAllocationsDTO], int]:
        result_allocations = []
        total_allocated = 0
        grouped_allocations = groupby(
            sorted(payload.allocations, key=lambda a: a.project_address),
            key=lambda a: a.project_address,
        )
        for project_address, project_allocations in grouped_allocations:
            project_allocations = self._calc_allocations(project_allocations)
            result_allocations.append(
                ProjectSumAllocationsDTO(project_address, project_allocations)
            )
            total_allocated += project_allocations

        return result_allocations, total_allocated
