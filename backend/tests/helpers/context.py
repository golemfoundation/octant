from app.context.epoch_details import EpochDetails
from app.context.epoch_state import EpochState
from app.context.manager import Context
from app.engine.epochs_settings import get_epoch_settings


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


def get_context(
    epoch_num: int = 1, epoch_state: EpochState = EpochState.CURRENT, **kwargs
) -> Context:
    epoch_details = get_epoch_details(epoch_num, **kwargs)
    epoch_settings = get_epoch_settings(epoch_num)
    return Context(
        epoch_state=epoch_state,
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
    )
