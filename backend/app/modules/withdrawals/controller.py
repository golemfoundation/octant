import dataclasses

from app.context.epoch_state import EpochState
from app.context.manager import state_context, Context
from app.exceptions import InvalidEpoch
from app.modules.registry import get_services


def get_withdrawable_eth(address: str) -> list[dict]:
    context = _get_context()
    service = get_services(context.epoch_state).withdrawals_service
    return [
        dataclasses.asdict(w) for w in service.get_withdrawable_eth(context, address)
    ]


def _get_context() -> Context:
    try:
        return state_context(EpochState.PENDING)
    except InvalidEpoch:
        return state_context(EpochState.FINALIZED)
