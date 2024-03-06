from dataclasses import dataclass, field

from app.engine.projects.rewards import ProjectRewards
from app.engine.projects.rewards.default import DefaultProjectRewards


@dataclass
class ProjectSettings:
    rewards: ProjectRewards = field(default_factory=DefaultProjectRewards)
