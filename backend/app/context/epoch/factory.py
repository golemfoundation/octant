from datetime import datetime
from typing import List

from app.context.epoch.block_range import get_blocks_range
from app.context.epoch.details import EpochDetails
from app.context.epoch_state import EpochState
from app.extensions import epochs
from app.infrastructure import graphql


def get_epoch_details(
    epoch_num: int, epoch_state: EpochState = None, **kwargs
) -> EpochDetails:
    match epoch_state:
        case EpochState.SIMULATED:
            return _get_simulated_epoch_details(epoch_num, **kwargs)
        case EpochState.FUTURE:
            return _get_future_epoch_details(epoch_num, **kwargs)
        case EpochState.CURRENT:
            return _get_current_epoch_details(epoch_num, **kwargs)
        case _:
            return _get_default_epoch_details(epoch_num, **kwargs)


def get_epochs_details(from_epoch: int, to_epoch: int, **kwargs) -> List[EpochDetails]:
    return [
        _get_default_epoch_details(epoch_num, **kwargs)
        for epoch_num in range(from_epoch, to_epoch)
    ]


def _get_simulated_epoch_details(epoch_num: int, **kwargs) -> EpochDetails:
    epoch_details = graphql.epochs.get_epoch_by_number(epoch_num)

    now_sec = int(datetime.utcnow().timestamp())
    start = epoch_details["fromTs"]
    duration = now_sec - start
    start_block, end_block = get_blocks_range(
        start, start + duration, now_sec, **kwargs
    )

    return EpochDetails(
        epoch_num=epoch_details["epoch"],
        start=start,
        duration=duration,
        decision_window=epoch_details["decisionWindow"],
        remaining_sec=0,
        start_block=start_block,
        end_block=end_block,
    )


def _get_future_epoch_details(epoch_num: int, **kwargs) -> EpochDetails:
    epoch_details = epochs.get_future_epoch_props()
    duration = epoch_details[3]
    return EpochDetails(
        epoch_num=epoch_num,
        start=epoch_details[2],
        duration=duration,
        decision_window=epoch_details[4],
        remaining_sec=duration,
    )


def _get_current_epoch_details(epoch_num: int, **kwargs) -> EpochDetails:
    epoch_details = graphql.epochs.get_epoch_by_number(epoch_num)

    now_sec = int(datetime.utcnow().timestamp())
    start = epoch_details["fromTs"]
    duration = epoch_details["duration"]
    end_sec = start + duration
    start_block, end_block = get_blocks_range(
        start, start + duration, now_sec, **kwargs
    )
    remaining_sec = end_sec - now_sec

    return EpochDetails(
        epoch_num=epoch_details["epoch"],
        start=epoch_details["fromTs"],
        duration=epoch_details["duration"],
        decision_window=epoch_details["decisionWindow"],
        remaining_sec=remaining_sec,
        start_block=start_block,
        end_block=end_block,
    )


def _get_default_epoch_details(epoch_num: int, **kwargs) -> EpochDetails:
    epoch_details = graphql.epochs.get_epoch_by_number(epoch_num)

    now_sec = int(datetime.utcnow().timestamp())
    start = epoch_details["fromTs"]
    duration = epoch_details["duration"]
    start_block, end_block = get_blocks_range(
        start, start + duration, now_sec, **kwargs
    )

    return EpochDetails(
        epoch_num=epoch_details["epoch"],
        start=epoch_details["fromTs"],
        duration=epoch_details["duration"],
        decision_window=epoch_details["decisionWindow"],
        remaining_sec=0,
        start_block=start_block,
        end_block=end_block,
    )
