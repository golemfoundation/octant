from app.core.epochs.epochs_registry import EpochsRegistry
from app.core.rewards.double_rewards_strategy import DoubleRewardsStrategy

EpochsRegistry.register_epoch_settings(1, DoubleRewardsStrategy())
