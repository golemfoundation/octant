from app.context.manager import epoch_context
from app.modules.user.winnings.service.raffle import RaffleWinningsService
from app.modules.registry import get_services


def get_user_winnings(epoch_num: int, user_address: str):
    context = epoch_context(epoch_num)
    service: RaffleWinningsService = get_services(
        context.epoch_state
    ).user_rewards_service.user_winnings_service

    return service.get_user_winnings(user_address)
