from dataclasses import dataclass, field

from app.v2.engine.octant_rewards.locked_ratio import LockedRatio
from app.v2.engine.octant_rewards.locked_ratio.default import DefaultLockedRatio
from app.v2.engine.octant_rewards.matched import MatchedRewards
from app.v2.engine.octant_rewards.matched.default import DefaultMatchedRewards
from app.v2.engine.octant_rewards.total_and_individual import (
    TotalAndAllIndividualRewards,
)
from app.v2.engine.octant_rewards.total_and_individual.default import (
    DefaultTotalAndAllIndividualRewards,
)


@dataclass
class OctantRewardsSettings:
    locked_ratio: LockedRatio = field(default_factory=DefaultLockedRatio)
    total_and_all_individual_rewards: TotalAndAllIndividualRewards = field(
        default_factory=DefaultTotalAndAllIndividualRewards
    )
    matched_rewards: MatchedRewards = field(default_factory=DefaultMatchedRewards)
