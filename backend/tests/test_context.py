import pytest

from app.core.rewards.all_proceeds_with_op_cost_rewards_strategy import (
    AllProceedsWithOperationalCostStrategy,
)
from app.core.rewards.standard_rewards_strategy import StandardRewardsStrategy
from app.extensions import db

from app import (
    database,
    TimebasedWithoutUnlocksWeightsCalculator,
    TimebasedWeightsCalculator,
)
from app.context import ContextBuilder
from tests.conftest import (
    MOCK_EPOCHS,
    ETH_PROCEEDS,
    TOTAL_ED,
    LOCKED_RATIO,
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    USER1_ED,
    USER2_ED,
)


@pytest.fixture(autouse=True)
def before(app, patch_epochs):
    pass


def test_basic_context():
    MOCK_EPOCHS.get_current_epoch.return_value = 3
    MOCK_EPOCHS.get_pending_epoch.return_value = 2
    MOCK_EPOCHS.get_finalized_epoch.return_value = 1

    context = ContextBuilder().build()

    assert context.current_epoch == 3
    assert context.pending_epoch == 2
    assert context.finalized_epoch == 1
    assert context.current_epoch_context is None
    assert context.pending_epoch_context is None
    assert context.finalized_epoch_context is None


def test_current_epoch_context(user_accounts):
    context = ContextBuilder().with_current_epoch_context().build()

    assert isinstance(
        context.current_epoch_context.epoch_settings.rewards_strategy,
        StandardRewardsStrategy,
    )
    assert (
        context.current_epoch_context.epoch_settings.user_deposits_weights_calculator
        == TimebasedWithoutUnlocksWeightsCalculator
    )


def test_pending_epoch_context(user_accounts, mock_pending_epoch_snapshot_db):
    context = (
        ContextBuilder()
        .with_pending_epoch_context(
            [user_accounts[0].address, user_accounts[1].address]
        )
        .build()
    )

    assert isinstance(
        context.pending_epoch_context.epoch_settings.rewards_strategy,
        AllProceedsWithOperationalCostStrategy,
    )
    assert (
        context.pending_epoch_context.epoch_settings.user_deposits_weights_calculator
        == TimebasedWeightsCalculator
    )
    assert context.pending_epoch_context.pending_snapshot is not None
    assert len(context.pending_epoch_context.users_context) == 2


def test_finalized_epoch_context(user_accounts, mock_finalized_epoch_snapshot_db):
    context = ContextBuilder().with_finalized_epoch_context().build()

    assert isinstance(
        context.finalized_epoch_context.epoch_settings.rewards_strategy,
        AllProceedsWithOperationalCostStrategy,
    )
    assert (
        context.finalized_epoch_context.epoch_settings.user_deposits_weights_calculator
        == TimebasedWeightsCalculator
    )
    assert context.finalized_epoch_context.finalized_snapshot is not None
