from app.v2.context.context import (
    Context,
    CurrentEpochContext,
    EpochContext,
    OctantRewardsContext,
)
from app.v2.context.epoch import EpochDetails
from app.v2.engine.epochs_settings import get_epoch_settings
from tests.conftest import (
    MOCKED_CURRENT_EPOCH_NO,
    MOCKED_PENDING_EPOCH_NO,
    ETH_PROCEEDS,
    TOTAL_ED,
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    LOCKED_RATIO,
)


def get_epoch_details(
    epoch_no: int, start=1000, duration=1000, decision_window=500, remaining_sec=1000
):
    return EpochDetails(
        epoch_no=epoch_no,
        duration=duration,
        start=start,
        decision_window=decision_window,
        remaining_sec=remaining_sec,
    )


def get_octant_rewards(
    eth_proceeds=ETH_PROCEEDS,
    total_effective_deposit=TOTAL_ED,
    total_rewards=TOTAL_REWARDS,
    individual_rewards=ALL_INDIVIDUAL_REWARDS,
    locked_ratio=LOCKED_RATIO,
    **kwargs
):
    return OctantRewardsContext(
        eth_proceeds=eth_proceeds,
        total_effective_deposit=total_effective_deposit,
        total_rewards=total_rewards,
        individual_rewards=individual_rewards,
        locked_ratio=locked_ratio,
    )


def get_epoch_context(epoch_no: int, **kwargs) -> EpochContext:
    epoch_details = get_epoch_details(epoch_no, **kwargs)
    epoch_settings = get_epoch_settings(epoch_no)
    octant_rewards = get_octant_rewards(**kwargs)
    return CurrentEpochContext(
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
        octant_rewards=octant_rewards,
    )


def get_context(
    current_epoch=MOCKED_CURRENT_EPOCH_NO,
    pending_epoch=MOCKED_PENDING_EPOCH_NO,
    finalized_epoch=0,
    finalized_epoch_context=None,
    pending_epoch_context=None,
    current_epoch_context=None,
    future_epoch_context=None,
    users_context=None,
) -> Context:
    return Context(
        current_epoch=current_epoch,
        pending_epoch=pending_epoch,
        finalized_epoch=finalized_epoch,
        finalized_epoch_context=finalized_epoch_context,
        pending_epoch_context=pending_epoch_context,
        current_epoch_context=current_epoch_context,
        future_epoch_context=future_epoch_context,
        users_context=users_context,
    )
