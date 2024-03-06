from app.engine.projects.rewards.threshold import (
    ProjectThreshold,
    ProjectThresholdPayload,
)


class DefaultProjectThreshold(ProjectThreshold):
    def calculate_threshold(self, payload: ProjectThresholdPayload) -> int:
        return (
            int(payload.total_allocated / (payload.projects_count * 2))
            if payload.projects_count
            else 0
        )
