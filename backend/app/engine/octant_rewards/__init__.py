from dataclasses import dataclass, field

from app.engine.octant_rewards.locked_ratio import LockedRatio
from app.engine.octant_rewards.locked_ratio.default import DefaultLockedRatio
from app.engine.octant_rewards.matched import MatchedRewards
from app.engine.octant_rewards.matched.default import DefaultMatchedRewards
from app.engine.octant_rewards.operational_cost import OperationalCost
from app.engine.octant_rewards.operational_cost.op_cost_20percent import OpCost20Percent
from app.engine.octant_rewards.total_and_individual import TotalAndAllIndividualRewards
from app.engine.octant_rewards.total_and_individual.default import (
    DefaultTotalAndAllIndividualRewards,
)


@dataclass
class OctantRewardsSettings:
    locked_ratio: LockedRatio = field(default_factory=DefaultLockedRatio)
    operational_cost: OperationalCost = field(default_factory=OpCost20Percent)
    total_and_all_individual_rewards: TotalAndAllIndividualRewards = field(
        default_factory=DefaultTotalAndAllIndividualRewards
    )
    matched_rewards: MatchedRewards = field(default_factory=DefaultMatchedRewards)
