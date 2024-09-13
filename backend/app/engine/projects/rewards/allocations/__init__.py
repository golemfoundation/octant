from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal
from itertools import groupby
from typing import List, Union, Optional, Dict

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class AllocationItem:
    project_address: str
    amount: int
    uq_score: Optional[Decimal] = None


@dataclass(frozen=True)
class ProjectSumAllocationsDTO(JSONWizard):
    project_address: str
    amount: Union[int, Decimal]


@dataclass
class ProjectAllocationsPayload:
    allocations: List[AllocationItem] = None


@dataclass
class ProjectAllocations(ABC):
    @abstractmethod
    def _calc_allocations(
        self, allocations: List[AllocationItem]
    ) -> Union[int, Decimal]:
        ...

    def segregate_allocations(
        self, payload: ProjectAllocationsPayload
    ) -> Dict[str, List]:
        grouped_allocations = {
            key: list(group)
            for key, group in groupby(
                sorted(payload.allocations, key=lambda a: a.project_address),
                key=lambda a: a.project_address,
            )
        }
        return grouped_allocations

    def group_allocations_by_projects(
        self, payload: ProjectAllocationsPayload
    ) -> (Dict[str, List], List[ProjectSumAllocationsDTO], Union[int, Decimal]):
        grouped_allocations = self.segregate_allocations(payload)

        result_allocations = []
        total_plain_qf = 0
        for project_address, project_allocations in grouped_allocations.items():
            project_allocations = self._calc_allocations(project_allocations)
            result_allocations.append(
                ProjectSumAllocationsDTO(project_address, project_allocations)
            )
            total_plain_qf += project_allocations

        return grouped_allocations, result_allocations, total_plain_qf
