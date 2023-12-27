from app.v2.context.epoch_state import EpochState
from app.v2.context.manager import state_context, epoch_context
from app.v2.modules.registry import get_services


def estimate_total_effective_deposit() -> int:
    with state_context(EpochState.CURRENT) as context:
        return context.octant_rewards.total_effective_deposit


def get_user_effective_deposit(user_address: str, epoch: int) -> int:
    with epoch_context(epoch) as context:
        service = get_services(context.epoch_state).user_deposits_service
        return service.get_user_effective_deposit(context, user_address)


def estimate_user_effective_deposit(user_address: str) -> int:
    with state_context(EpochState.CURRENT) as context:
        service = get_services(context.epoch_state).user_deposits_service
        return service.get_user_effective_deposit(context, user_address)
