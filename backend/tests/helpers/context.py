from app.v2.context.context import OctantRewards, Context
from app.v2.context.epoch_details import EpochDetails
from app.v2.context.epoch_state import EpochState
from app.v2.engine.epochs_settings import get_epoch_settings
from tests.conftest import (
    ETH_PROCEEDS,
    TOTAL_ED,
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    LOCKED_RATIO,
)


def get_epoch_details(
    epoch_num: int, start=1000, duration=1000, decision_window=500, remaining_sec=1000
):
    return EpochDetails(
        epoch_num=epoch_num,
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
    return OctantRewards(
        eth_proceeds=eth_proceeds,
        total_effective_deposit=total_effective_deposit,
        total_rewards=total_rewards,
        individual_rewards=individual_rewards,
        locked_ratio=locked_ratio,
    )


def get_context(epoch_num: int = 1, epoch_state: EpochState = EpochState.CURRENT, **kwargs) -> Context:
    epoch_details = get_epoch_details(epoch_num, **kwargs)
    epoch_settings = get_epoch_settings(epoch_num)
    octant_rewards = get_octant_rewards(**kwargs)
    return Context(
        epoch_state=epoch_state,
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
        octant_rewards=octant_rewards,
    )
