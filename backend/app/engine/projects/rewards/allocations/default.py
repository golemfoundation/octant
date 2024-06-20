from itertools import groupby
from typing import Tuple, List

from app.engine.projects.rewards.allocations import (
    ProjectAllocationsPayload,
    ProjectAllocations,
)


class DefaultProjectAllocations(ProjectAllocations):
    def group_allocations_by_projects(
        self, payload: ProjectAllocationsPayload
    ) -> [List[Tuple[str, int]], int]:
        result_allocations = []
        total_allocated = 0
        grouped_allocations = groupby(
            sorted(payload.allocations, key=lambda a: a.project_address),
            key=lambda a: a.project_address,
        )
        for project_address, project_allocations in grouped_allocations:
            project_allocations = sum(
                [int(allocation.amount) for allocation in project_allocations]
            )
            result_allocations.append((project_address, project_allocations))
            total_allocated += project_allocations

        return result_allocations, total_allocated
