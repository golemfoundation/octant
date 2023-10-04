from app.core.epochs.epochs_registry import EpochsRegistry
from app.core.rewards.all_proceeds_with_op_cost_rewards_strategy import (
    AllProceedsWithOperationalCostStrategy,
)

EpochsRegistry.register_epoch_settings(1, AllProceedsWithOperationalCostStrategy())
