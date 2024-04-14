from typing import Tuple, List

from app.context.epoch_state import EpochState
from app.context.manager import epoch_context
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.registry import get_services


def get_unused_rewards(epoch_num: int) -> Tuple[List[str], int]:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service = get_services(context.epoch_state).user_rewards_service
    unused_rewards = service.get_unused_rewards(context)

    return (
        list(unused_rewards.keys()),
        sum(unused_rewards.values()),
    )


def get_sum_of_claimed_rewards(epoch_num: int) -> int:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service = get_services(context.epoch_state).user_rewards_service
    _, claimed_rewards_sum = service.get_claimed_rewards(context)

    return claimed_rewards_sum
