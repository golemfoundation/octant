from app.context.context import Context
from app.context.epoch_details import get_epoch_details
from app.context.epoch_state import EpochState, get_epoch_state, get_epoch_number
from app.engine.epochs_settings import get_epoch_settings
from app.modules.registry import get_services

from flask import current_app as app


def epoch_context(epoch_num: int, with_rewards=True) -> Context:
    epoch_state = get_epoch_state(epoch_num)
    return build_context(epoch_num, epoch_state, with_rewards)


def state_context(epoch_state: EpochState, with_rewards=True) -> Context:
    epoch_num = get_epoch_number(epoch_state)
    return build_context(epoch_num, epoch_state, with_rewards)


def build_context(
    epoch_num: int, epoch_state: EpochState, with_rewards: bool
) -> Context:
    epoch_details = get_epoch_details(epoch_num, epoch_state)
    epoch_settings = get_epoch_settings(epoch_num)
    context = Context(
        epoch_state=epoch_state,
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
    )
    if with_rewards:
        service = get_services(epoch_state).octant_rewards_service
        context.octant_rewards = service.get_octant_rewards(context)

    app.logger.debug(
        f"Epoch num: {epoch_details.epoch_num}, epoch state: {epoch_state}"
    )
    return context
