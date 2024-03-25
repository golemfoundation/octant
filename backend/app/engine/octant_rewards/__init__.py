from dataclasses import dataclass, field
from decimal import Decimal

from app.engine.octant_rewards.community_fund.calculator import (
    CommunityFundCalculator,
    CommunityFundPercent,
)
from app.engine.octant_rewards.locked_ratio import LockedRatio
from app.engine.octant_rewards.locked_ratio.default import DefaultLockedRatio
from app.engine.octant_rewards.matched import MatchedRewards
from app.engine.octant_rewards.matched.with_ppf import MatchedRewardsWithPPF
from app.engine.octant_rewards.operational_cost import OperationalCost
from app.engine.octant_rewards.operational_cost.op_cost_percent import OpCostPercent
from app.engine.octant_rewards.ppf.calculator import PPFCalculatorPercent, PPFCalculator
from app.engine.octant_rewards.total_and_individual import TotalAndAllIndividualRewards
from app.engine.octant_rewards.total_and_individual.tr_from_staking import (
    PercentTotalAndAllIndividualRewards,
)


class OctantRewardsDefaultValues:
    OPERATIONAL_COST = Decimal("0.25")
    PPF = Decimal("0.35")
    COMMUNITY_FUND = Decimal("0.05")
    TR_PERCENT = Decimal("0.7")


@dataclass
class OctantRewardsSettings:
    locked_ratio: LockedRatio = field(default_factory=DefaultLockedRatio)
    operational_cost: OperationalCost = field(
        default_factory=lambda: OpCostPercent(
            OctantRewardsDefaultValues.OPERATIONAL_COST
        )
    )
    total_and_all_individual_rewards: TotalAndAllIndividualRewards = field(
        default_factory=lambda: PercentTotalAndAllIndividualRewards(
            OctantRewardsDefaultValues.TR_PERCENT
        )
    )
    matched_rewards: MatchedRewards = field(default_factory=MatchedRewardsWithPPF)

    ppf: PPFCalculator = field(
        default_factory=lambda: PPFCalculatorPercent(OctantRewardsDefaultValues.PPF)
    )
    community_fund: CommunityFundCalculator = field(
        default_factory=lambda: CommunityFundPercent(
            OctantRewardsDefaultValues.COMMUNITY_FUND
        )
    )
