from contextlib import contextmanager

from app.v2.context.context import Context
from app.v2.context.epoch_details import get_epoch_details
from app.v2.context.epoch_state import EpochState, get_epoch_state, get_epoch_number
from app.v2.engine.epochs_settings import get_epoch_settings


@contextmanager
def epoch_context(epoch_num: int) -> Context:
    try:
        epoch_state = get_epoch_state(epoch_num)
        yield build_context(epoch_num, epoch_state)
    finally:
        ...


@contextmanager
def state_context(epoch_state: EpochState) -> Context:
    try:
        epoch_num = get_epoch_number(epoch_state)
        yield build_context(epoch_num, epoch_state)
    finally:
        ...


def build_context(epoch_num: int, epoch_state: EpochState) -> Context:
    epoch_details = get_epoch_details(epoch_num, epoch_state)
    epoch_settings = get_epoch_settings(epoch_num)
    context = Context(
        epoch_state=epoch_state,
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
    )
    service = get_octant_rewards_service(epoch_state)
    context.octant_rewards = service.get_octant_rewards(context)

    return context
