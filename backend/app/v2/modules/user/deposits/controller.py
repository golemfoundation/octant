from app.v2.context.builder import ContextBuilder
from app.v2.modules.user.deposits.service.factory import get_user_deposits_service


def estimate_total_effective_deposit() -> int:
    context = (
        ContextBuilder().with_current_epoch_context().with_octant_rewards().build()
    )
    return context.current_epoch_context.octant_rewards.total_effective_deposit


def get_user_effective_deposit(user_address: str, epoch: int) -> int:
    context = ContextBuilder().with_epoch_context(epoch).build()
    deposits_service = get_user_deposits_service(context.epoch_context)

    return deposits_service.get_user_effective_deposit(
        context.epoch_context, user_address
    )


def estimate_user_effective_deposit(user_address: str) -> int:
    context = ContextBuilder().with_current_epoch_context().build()
    deposits_service = get_user_deposits_service(context.current_epoch_context)

    return deposits_service.get_user_effective_deposit(
        context.current_epoch_context, user_address
    )
