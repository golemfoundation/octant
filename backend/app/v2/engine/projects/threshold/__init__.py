from dataclasses import dataclass


@dataclass
class ProjectThresholdPayload:
    total_allocated: int = None
    proposals_count: int = None
