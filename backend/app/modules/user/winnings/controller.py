from typing import List

from app.context.manager import state_context
from app.modules.registry import get_services
from app.modules.modules_factory.protocols import WinningsService
from app.modules.user.winnings.service.raffle import UserWinningDTO
from app.context.epoch_state import EpochState


def get_user_winnings(user_address: str) -> List[UserWinningDTO]:
    context = state_context(EpochState.CURRENT)
    service: WinningsService = get_services(
        context.epoch_state
    ).user_winnings_service

    return service.get_user_winnings(context, user_address)
