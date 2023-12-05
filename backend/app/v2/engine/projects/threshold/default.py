from app.v2.engine.projects.threshold import ProjectThresholdPayload


class DefaultProjectThreshold:
    def calculate_threshold(self, payload: ProjectThresholdPayload) -> int:
        return int(payload.total_allocated / (payload.proposals_count * 2))
