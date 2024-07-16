from decimal import Decimal
from typing import List, Tuple

from app.context.epoch_state import EpochState
from app.context.manager import epoch_context
from app.exceptions import (
    NotImplementedForGivenEpochState,
)
from app.modules.registry import get_services


def get_uq(user_address: str, epoch_num: int) -> Decimal:
    context = epoch_context(epoch_num)

    if (
        context.epoch_state == EpochState.FINALIZED
        or context.epoch_state == EpochState.FUTURE
    ):
        raise NotImplementedForGivenEpochState()

    service = get_services(context.epoch_state).uniqueness_quotients
    return service.retrieve(context, user_address)


def get_all_uqs(epoch_num: int) -> List[Tuple[str, Decimal]]:
    context = epoch_context(epoch_num)
    service = get_services(context.epoch_state).uniqueness_quotients
    return service.get_all(context)
