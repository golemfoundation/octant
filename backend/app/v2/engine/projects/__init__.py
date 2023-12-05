from dataclasses import dataclass

from app.v2.engine.projects.rewards import ProjectRewards
from app.v2.engine.projects.rewards.default import DefaultProjectRewards
from app.v2.engine.projects.threshold import ProjectThreshold
from app.v2.engine.projects.threshold.default import DefaultProjectThreshold


@dataclass
class ProjectSettings:
    threshold: ProjectThreshold = (DefaultProjectThreshold(),)
    rewards: ProjectRewards = DefaultProjectRewards()
