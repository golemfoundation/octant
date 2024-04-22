from app.context.epoch_state import EpochState
from app.context.manager import epoch_context
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.dto import OctantRewardsDTO
from app.modules.registry import get_services
from app.extensions import epochs
from app.modules.common.validations.user_validations import (
    validate_if_given_epoch_has_previous_one,
)


def get_octant_rewards(epoch_num: int) -> OctantRewardsDTO:
    context = epoch_context(epoch_num)
    service = get_services(context.epoch_state).octant_rewards_service
    return service.get_octant_rewards(context)


def get_leverage(epoch_num: int) -> float:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service = get_services(context.epoch_state).octant_rewards_service
    return service.get_leverage(context)


def get_last_epoch_leverage() -> float:
    current_epoch_num = epochs.get_current_epoch()
    validate_if_given_epoch_has_previous_one(current_epoch_num)

    return get_leverage(current_epoch_num - 1)
