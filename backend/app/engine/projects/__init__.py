from dataclasses import dataclass, field

from app.engine.projects.rewards import ProjectRewards
from app.engine.projects.rewards.default import DefaultProjectRewards
from app.engine.projects.threshold import ProjectThreshold
from app.engine.projects.threshold.default import DefaultProjectThreshold


@dataclass
class ProjectSettings:
    threshold: ProjectThreshold = field(default_factory=DefaultProjectThreshold)
    rewards: ProjectRewards = field(default_factory=DefaultProjectRewards)
