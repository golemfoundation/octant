from collections import defaultdict
from dataclasses import dataclass, field
from decimal import Decimal

from app.engine.octant_rewards import OctantRewardsSettings
from app.engine.octant_rewards.community_fund.not_supported import (
    NotSupportedCFCalculator,
)
from app.engine.octant_rewards.matched.preliminary import (
    PreliminaryMatchedRewards,
)
from app.engine.octant_rewards.operational_cost.op_cost_percent import OpCostPercent
from app.engine.octant_rewards.ppf.not_supported import NotSupportedPPFCalculator
from app.engine.octant_rewards.total_and_individual.all_proceeds_with_op_cost import (
    AllProceedsWithOperationalCost,
)
from app.engine.octant_rewards.total_and_individual.preliminary import (
    PreliminaryTotalAndAllIndividualRewards,
)
from app.engine.projects import ProjectSettings, DefaultProjectRewards
from app.engine.projects.rewards.threshold.default import DefaultProjectThreshold
from app.engine.user.budget.preliminary import PreliminaryUserBudget
from app.engine.user import UserSettings, DefaultWeightedAverageEffectiveDeposit
from app.engine.user.effective_deposit.weighted_average.weights.timebased.default import (
    DefaultTimebasedWeights,
)


@dataclass
class EpochSettings:
    octant_rewards: OctantRewardsSettings = field(default_factory=OctantRewardsSettings)
    user: UserSettings = field(default_factory=UserSettings)
    project: ProjectSettings = field(default_factory=ProjectSettings)


SETTINGS: dict[int, EpochSettings] = defaultdict(lambda: EpochSettings())


def get_epoch_settings(epoch_number: int) -> EpochSettings:
    return SETTINGS[epoch_number]


def register_epoch_settings():
    SETTINGS[1] = EpochSettings(
        octant_rewards=OctantRewardsSettings(
            total_and_all_individual_rewards=AllProceedsWithOperationalCost(),
            matched_rewards=PreliminaryMatchedRewards(),
            operational_cost=OpCostPercent(Decimal("0.20")),
            ppf=NotSupportedPPFCalculator(),
            community_fund=NotSupportedCFCalculator(),
        ),
        user=UserSettings(
            budget=PreliminaryUserBudget(),
            effective_deposit=DefaultWeightedAverageEffectiveDeposit(
                timebased_weights=DefaultTimebasedWeights(),
            ),
        ),
        project=ProjectSettings(
            rewards=DefaultProjectRewards(
                projects_threshold=DefaultProjectThreshold(2),
            ),
        ),
    )

    SETTINGS[2] = EpochSettings(
        octant_rewards=OctantRewardsSettings(
            total_and_all_individual_rewards=PreliminaryTotalAndAllIndividualRewards(),
            matched_rewards=PreliminaryMatchedRewards(),
            ppf=NotSupportedPPFCalculator(),
            community_fund=NotSupportedCFCalculator(),
        ),
        user=UserSettings(budget=PreliminaryUserBudget()),
        project=ProjectSettings(
            rewards=DefaultProjectRewards(
                projects_threshold=DefaultProjectThreshold(2),
            ),
        ),
    )

    SETTINGS[3] = EpochSettings()
