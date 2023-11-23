from app.core.epochs.epochs_registry import EpochsRegistry

from app.core.rewards.standard_rewards_strategy import StandardRewardsStrategy
from app.core.rewards.all_proceeds_with_op_cost_rewards_strategy import (
    AllProceedsWithOperationalCostStrategy,
)
from app.core.deposits.weighted_deposits.timebased_calculator import (
    TimebasedWeightsCalculator,
)
from app.core.deposits.weighted_deposits.timebased_without_unlocks_calculator import (
    TimebasedWithoutUnlocksWeightsCalculator,
)


def test_epoch_1_settings(app):
    settings = EpochsRegistry.get_epoch_settings(1)

    assert isinstance(settings.rewards_strategy, AllProceedsWithOperationalCostStrategy)
    assert settings.user_deposits_weights_calculator == TimebasedWeightsCalculator


def test_epoch_2_settings(app):
    settings = EpochsRegistry.get_epoch_settings(2)

    assert isinstance(settings.rewards_strategy, StandardRewardsStrategy)
    assert (
        settings.user_deposits_weights_calculator
        == TimebasedWithoutUnlocksWeightsCalculator
    )


def test_default_settings(app):
    settings = EpochsRegistry.get_epoch_settings(-1)

    assert isinstance(settings.rewards_strategy, StandardRewardsStrategy)
    assert settings.user_deposits_weights_calculator == TimebasedWeightsCalculator
