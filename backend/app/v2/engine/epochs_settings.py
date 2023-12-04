from collections import defaultdict
from dataclasses import dataclass

from app import TimebasedWeightsCalculator
from app.core.deposits.weighted_deposits.timebased_without_unlocks_calculator import (
    TimebasedWithoutUnlocksWeightsCalculator,
)

from app.v2.base.octant_rewards.locked_ratio.default import DefaultLockedRatioStrategy
from app.v2.base.octant_rewards.total_and_individual.all_proceeds_with_op_cost import \
    AllProceedsWithOperationalCostStrategy
from app.v2.base.octant_rewards.total_and_individual.default import DefaultRewardsStrategy
from app.v2.base.user.budget.default import DefaultUserBudget


@dataclass(frozen=True)
class EpochSettings:
    rewards_strategy = DefaultRewardsStrategy()
    user_deposits_weights_calculator = TimebasedWithoutUnlocksWeightsCalculator()
    locked_ratio = DefaultLockedRatioStrategy()
    user_budget = DefaultUserBudget()


SETTINGS: dict[int, EpochSettings] = defaultdict(lambda: EpochSettings())


def get_epoch_settings(epoch_number: int) -> EpochSettings:
    return SETTINGS[epoch_number]


def register_epoch_settings():
    SETTINGS[1] = EpochSettings(
        rewards_strategy=AllProceedsWithOperationalCostStrategy(),
        user_deposits_weights_calculator=TimebasedWeightsCalculator(),
    )
    SETTINGS[2] = EpochSettings(
        user_deposits_weights_calculator=TimebasedWithoutUnlocksWeightsCalculator(),
    )
