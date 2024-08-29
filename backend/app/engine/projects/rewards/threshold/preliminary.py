from dataclasses import dataclass
from typing import List

from app.engine.projects.rewards import AllocationItem, AllocationsBelowThreshold
from app.engine.projects.rewards.threshold import (
    ProjectThreshold,
    ProjectThresholdPayload,
)


@dataclass
class PreliminaryProjectThreshold(ProjectThreshold):
    PROJECTS_COUNT_MULTIPLIER: int

    def calculate_threshold(self, payload: ProjectThresholdPayload) -> int:
        return (
            int(
                payload.total_allocated
                / (payload.projects_count * self.PROJECTS_COUNT_MULTIPLIER)
            )
            if payload.projects_count
            else 0
        )

    def get_total_allocations_below_threshold(
        self, allocations: List[AllocationItem], no_projects: int
    ) -> AllocationsBelowThreshold:
        allocations_sum = sum(map(lambda x: x.amount, allocations))
        threshold = self.calculate_threshold(
            ProjectThresholdPayload(allocations_sum, no_projects)
        )

        allocations_below_threshold = 0
        for allocation in allocations:
            if allocation.amount < threshold:
                allocations_below_threshold += allocation.amount

        return AllocationsBelowThreshold(allocations_below_threshold, allocations_sum)
