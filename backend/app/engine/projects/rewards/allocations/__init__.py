from abc import ABC, abstractmethod
from copy import deepcopy
from dataclasses import dataclass
from decimal import Decimal
from itertools import groupby
from typing import List, Union, Optional

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

    def group_allocations_by_projects(
        self, payload: ProjectAllocationsPayload
    ) -> (List[ProjectSumAllocationsDTO], Union[int, Decimal]):
        result_allocations = []
        original_grouped_allocations = groupby(
            sorted(payload.allocations, key=lambda a: a.project_address),
            key=lambda a: a.project_address,
        )
        grouped_allocations = deepcopy(original_grouped_allocations)

        total_plain_qf = 0
        for project_address, project_allocations in grouped_allocations:
            project_allocations = self._calc_allocations(project_allocations)
            result_allocations.append(
                ProjectSumAllocationsDTO(project_address, project_allocations)
            )
            total_plain_qf += project_allocations

        return original_grouped_allocations, result_allocations, total_plain_qf
