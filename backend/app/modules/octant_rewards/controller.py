from app.context.epoch_state import EpochState
from app.context.manager import epoch_context, state_context
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.dto import OctantRewardsDTO
from app.modules.registry import get_services
from app.modules.octant_rewards import core


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


def get_last_finalized_epoch_leverage() -> float:
    context = state_context(EpochState.FINALIZED)
    service = get_services(context.epoch_state).octant_rewards_service

    return service.get_leverage(context)


def get_epoch_rewards_rate(epoch_num: int) -> float:
    context = epoch_context(epoch_num)
    return core.get_rewards_rate(context.epoch_details.epoch_num)
