from app.engine.projects.threshold import ProjectThresholdPayload, ProjectThreshold


class DefaultProjectThreshold(ProjectThreshold):
    def calculate_threshold(self, payload: ProjectThresholdPayload) -> int:
        return int(payload.total_allocated / (payload.proposals_count * 2))
