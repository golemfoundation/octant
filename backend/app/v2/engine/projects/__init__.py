from dataclasses import dataclass, field

from app.v2.engine.projects.rewards import ProjectRewards
from app.v2.engine.projects.rewards.default import DefaultProjectRewards
from app.v2.engine.projects.threshold import ProjectThreshold
from app.v2.engine.projects.threshold.default import DefaultProjectThreshold


@dataclass
class ProjectSettings:
    threshold: ProjectThreshold = field(default_factory=DefaultProjectThreshold)
    rewards: ProjectRewards = field(default_factory=DefaultProjectRewards)
