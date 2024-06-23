from decimal import Decimal

from app.context.epoch_state import EpochState
from app.context.manager import epoch_context
from app.exceptions import (
    NotImplementedForGivenEpochState,
)
from app.modules.registry import get_services


def get_uq(user_address: str, epoch_num: int) -> Decimal:
    context = epoch_context(epoch_num)

    if context.epoch_state != EpochState.PENDING:
        raise NotImplementedForGivenEpochState()

    service = get_services(
        context.epoch_state
    ).user_rewards_service.allocations.uniqueness_quotients
    return service.retrieve(context, user_address)
