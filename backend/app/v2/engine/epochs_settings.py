from collections import defaultdict
from dataclasses import dataclass

from app import TimebasedWeightsCalculator
from app.core.deposits.weighted_deposits.timebased_without_unlocks_calculator import (
    TimebasedWithoutUnlocksWeightsCalculator,
)
from app.v2.engine.octant_rewards.locked_ratio.default import DefaultLockedRatio

from app.v2.engine.octant_rewards.matched.default import DefaultMatchedRewards
from app.v2.engine.octant_rewards.total_and_individual.all_proceeds_with_op_cost import \
    AllProceedsWithOperationalCost
from app.v2.engine.octant_rewards.total_and_individual.default import \
    DefaultTotalAndIndividualRewards
from app.v2.engine.projects.threshold.default import DefaultProjectThreshold
from app.v2.engine.user.budget.default import DefaultUserBudget


@dataclass(frozen=True)
class EpochSettings:
    total_and_all_individual_rewards = DefaultTotalAndIndividualRewards()
    matched_rewards = DefaultMatchedRewards()
    user_deposits_weights_calculator = TimebasedWithoutUnlocksWeightsCalculator()
    locked_ratio = DefaultLockedRatio()
    user_budget = DefaultUserBudget()
    project_threshold = DefaultProjectThreshold()


SETTINGS: dict[int, EpochSettings] = defaultdict(lambda: EpochSettings())


def get_epoch_settings(epoch_number: int) -> EpochSettings:
    return SETTINGS[epoch_number]


def register_epoch_settings():
    SETTINGS[1] = EpochSettings(
        total_and_all_individual_rewards=AllProceedsWithOperationalCost(),
        user_deposits_weights_calculator=TimebasedWeightsCalculator(),
    )
