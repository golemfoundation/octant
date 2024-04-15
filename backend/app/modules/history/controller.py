from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.history.dto import UserHistoryDTO
from app.modules.registry import get_services


def get_user_history(
    user_address: str, cursor: str = None, limit: int = 20
) -> UserHistoryDTO:
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).history_service

    return service.get_user_history(context, user_address, cursor, limit)
