from typing import List

from app.engine.projects.rewards.allocations import (
    ProjectAllocations,
    AllocationItem,
)


class PreliminaryProjectAllocations(ProjectAllocations):
    def _calc_allocations(self, allocations: List[AllocationItem]) -> int:
        return sum([int(allocation.amount) for allocation in allocations])
