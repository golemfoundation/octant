from app.context.epoch_state import EpochState
from app.context.manager import state_context, epoch_context
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.modules_factory.current import CurrentServices
from app.modules.registry import get_services


def estimate_total_effective_deposit() -> int:
    context = state_context(EpochState.CURRENT)
    services: CurrentServices = get_services(context.epoch_state)
    return services.user_deposits_service.get_total_effective_deposit(context)


def get_user_effective_deposit(user_address: str, epoch: int) -> int:
    context = epoch_context(epoch)
    if context.epoch_state > EpochState.CURRENT:
        raise NotImplementedForGivenEpochState()
    service = get_services(context.epoch_state).user_deposits_service
    return service.get_user_effective_deposit(context, user_address)


def estimate_user_effective_deposit(user_address: str) -> int:
    context = state_context(EpochState.CURRENT)
    services: CurrentServices = get_services(context.epoch_state)
    return services.user_deposits_service.get_user_effective_deposit(
        context, user_address
    )
