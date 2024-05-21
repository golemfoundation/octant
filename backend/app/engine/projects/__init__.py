from dataclasses import dataclass, field

from app.engine.projects.rewards import ProjectRewards
from app.engine.projects.rewards.quadratic_funding import QuadraticFundingProjectRewards


@dataclass
class ProjectSettings:
    rewards: ProjectRewards = field(default_factory=QuadraticFundingProjectRewards)
