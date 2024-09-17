from dataclasses import dataclass
from typing import List, Dict

from app.engine.projects.rewards import AllocationsBelowThreshold
from app.engine.projects.rewards.threshold import (
    ProjectThreshold,
    ProjectThresholdPayload,
)
from app.engine.projects.rewards import AllocationItem


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
        self, allocations: Dict[str, List[AllocationItem]]
    ) -> AllocationsBelowThreshold:
        summed_allocations = {
            project: sum(map(lambda value: int(value.amount), values))
            for project, values in allocations.items()
        }
        total_allocations = sum(summed_allocations.values())
        no_projects = len(allocations.keys())

        threshold = self.calculate_threshold(
            ProjectThresholdPayload(total_allocations, no_projects)
        )

        allocations_below_threshold = 0
        for allocations_sum_for_project in summed_allocations.values():
            if allocations_sum_for_project < threshold:
                allocations_below_threshold += allocations_sum_for_project

        return AllocationsBelowThreshold(allocations_below_threshold, total_allocations)
