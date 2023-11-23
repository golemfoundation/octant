from dataclasses import dataclass
from typing import Type
from collections import defaultdict

from app.core.rewards.rewards_strategy import RewardsStrategy
from app.core.rewards.standard_rewards_strategy import StandardRewardsStrategy

from app.core.deposits.weighted_deposits.weights_calculator import WeightsCalculator
from app.core.deposits.weighted_deposits.timebased_calculator import (
    TimebasedWeightsCalculator,
)


@dataclass(frozen=True)
class EpochSettings:
    rewards_strategy: RewardsStrategy = StandardRewardsStrategy()
    user_deposits_weights_calculator: Type[
        WeightsCalculator
    ] = TimebasedWeightsCalculator


class EpochsRegistry:
    settings: dict[int, EpochSettings] = defaultdict(lambda: EpochSettings())

    @classmethod
    def register_epoch_settings(cls, epoch_number: int, **kwargs):
        cls.settings[epoch_number] = EpochSettings(**kwargs)

    @classmethod
    def get_epoch_settings(cls, epoch_number: int) -> EpochSettings:
        return cls.settings[epoch_number]
