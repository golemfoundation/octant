from dataclasses import dataclass, field
from decimal import Decimal

from app.engine.octant_rewards.community_fund.calculator import (
    CommunityFundCalculator,
    CommunityFundPercent,
)
from app.engine.octant_rewards.leftover import Leftover
from app.engine.octant_rewards.locked_ratio import LockedRatio
from app.engine.octant_rewards.locked_ratio.default import DefaultLockedRatio
from app.engine.octant_rewards.matched import MatchedRewards
from app.engine.octant_rewards.matched.percentage_from_staking import (
    PercentageMatchedRewards,
)
from app.engine.octant_rewards.operational_cost import OperationalCost
from app.engine.octant_rewards.operational_cost.op_cost_percent import OpCostPercent
from app.engine.octant_rewards.ppf.calculator import (
    PPFCalculatorFromRewards,
    PPFCalculator,
)
from app.engine.octant_rewards.total_and_individual import TotalAndAllIndividualRewards
from app.engine.octant_rewards.total_and_individual.tr_percent_calc import (
    PercentTotalAndAllIndividualRewards,
)
from app.engine.octant_rewards.leftover.with_ppf_and_unused import (
    LeftoverWithPPFAndUnusedMR,
)


class OctantRewardsDefaultValues:
    OPERATIONAL_COST = Decimal("0.25")
    COMMUNITY_FUND = Decimal("0.05")
    TR_PERCENT = Decimal("0.7")
    IRE_PERCENT = Decimal("0.35")
    MATCHED_REWARDS_PERCENT = Decimal("0.35")


@dataclass
class OctantRewardsSettings:
    locked_ratio: LockedRatio = field(default_factory=DefaultLockedRatio)
    operational_cost: OperationalCost = field(
        default_factory=lambda: OpCostPercent(
            OctantRewardsDefaultValues.OPERATIONAL_COST
        )
    )
    total_and_vanilla_individual_rewards: TotalAndAllIndividualRewards = field(
        default_factory=lambda: PercentTotalAndAllIndividualRewards(
            IRE_PERCENT=OctantRewardsDefaultValues.IRE_PERCENT,
            TR_PERCENT=OctantRewardsDefaultValues.TR_PERCENT,
        )
    )
    matched_rewards: MatchedRewards = field(
        default_factory=lambda: PercentageMatchedRewards(
            OctantRewardsDefaultValues.MATCHED_REWARDS_PERCENT
        )
    )

    ppf: PPFCalculator = field(default_factory=PPFCalculatorFromRewards)
    community_fund: CommunityFundCalculator = field(
        default_factory=lambda: CommunityFundPercent(
            OctantRewardsDefaultValues.COMMUNITY_FUND
        )
    )
    leftover: Leftover = field(default_factory=LeftoverWithPPFAndUnusedMR)
