from typing import Optional

from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.registry import get_services
from app.modules.user.antisybil.dto import AntisybilStatusDTO


def get_user_antisybil_status(user_address: str) -> Optional[AntisybilStatusDTO]:
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).user_antisybil_service
    return service.get_antisybil_status(context, user_address)


def update_user_antisybil_status(user_address: str) -> Optional[AntisybilStatusDTO]:
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).user_antisybil_service

    score, expires_at, all_stamps = service.fetch_antisybil_status(
        context, user_address
    )
    service.update_antisybil_status(
        context, user_address, score, expires_at, all_stamps
    )
    return service.get_antisybil_status(context, user_address)
