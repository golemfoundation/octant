from typing import List

from app.context.manager import state_context
from app.modules.registry import get_services
from app.modules.modules_factory.protocols import SablierStreamsService
from app.modules.user.sablier_streams.service.sablier_streams import UserStreamsDTO
from app.context.epoch_state import EpochState


def get_sablier_streams(user_address: str) -> List[UserStreamsDTO]:
    context = state_context(EpochState.CURRENT)
    service: SablierStreamsService = get_services(
        context.epoch_state
    ).sablier_streams_service

    return service.get_sablier_streams(context, user_address)
