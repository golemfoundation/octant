from dataclasses import dataclass

from app.core.rewards.rewards_strategy import RewardsStrategy
from app.core.rewards.standard_rewards_strategy import StandardRewardsStrategy


@dataclass(frozen=True)
class EpochSettings:
    rewardsStrategy: RewardsStrategy = StandardRewardsStrategy()


class EpochsRegistry:
    rewards_registry: dict[int, EpochSettings] = {}

    @classmethod
    def register_epoch_settings(
        cls, epoch_number: int, rewardsStrategy: RewardsStrategy
    ):
        cls.rewards_registry[epoch_number] = EpochSettings(rewardsStrategy)

    @classmethod
    def get_epoch_settings(cls, epoch_number: int) -> EpochSettings:
        return cls.rewards_registry.setdefault(epoch_number, EpochSettings())
