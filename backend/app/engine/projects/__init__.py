from dataclasses import dataclass, field

from app.engine.projects.rewards import ProjectRewards
from app.engine.projects.rewards.capped_quadratic_funding import (
    CappedQuadraticFundingProjectRewards,
)


@dataclass
class ProjectSettings:
    rewards: ProjectRewards = field(
        default_factory=CappedQuadraticFundingProjectRewards
    )
