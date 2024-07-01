from dataclasses import dataclass

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
