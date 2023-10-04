from dataclasses import dataclass

from app.core.rewards.rewards_strategy import RewardsStrategy
from app.core.rewards.standard_rewards_strategy import StandardRewardsStrategy


@dataclass(frozen=True)
class EpochSettings:
    rewards_strategy: RewardsStrategy = StandardRewardsStrategy()
    user_budget_strategy = None


class EpochsRegistry:
    settings: dict[int, EpochSettings] = {}

    @classmethod
    def register_epoch_settings(
        cls, epoch_number: int, rewards_strategy: RewardsStrategy
    ):
        cls.settings[epoch_number] = EpochSettings(rewards_strategy)

    @classmethod
    def get_epoch_settings(cls, epoch_number: int) -> EpochSettings:
        return cls.settings.setdefault(epoch_number, EpochSettings())
