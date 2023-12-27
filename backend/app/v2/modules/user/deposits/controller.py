from app.v2.context.epoch_state import EpochState
from app.v2.context.manager import state_context, epoch_context
from app.v2.modules.registry import get_services


def estimate_total_effective_deposit() -> int:
    context = state_context(EpochState.CURRENT)
    return context.octant_rewards.total_effective_deposit


def get_user_effective_deposit(user_address: str, epoch: int) -> int:
    context = epoch_context(epoch)
    service = get_services(context.epoch_state).user_deposits_service
    return service.get_user_effective_deposit(context, user_address)


def estimate_user_effective_deposit(user_address: str) -> int:
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).user_deposits_service
    return service.get_user_effective_deposit(context, user_address)
