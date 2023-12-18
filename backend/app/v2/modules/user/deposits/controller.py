from app.v2.context.builder import ContextBuilder
from app.v2.context.context import EpochContext
from app.v2.modules.user.deposits.events_generator import SubgraphEventsGenerator
from app.v2.modules.user.deposits.service import (
    UserDepositsEstimator,
    UserDepositsCalculator,
    UserDepositsReader,
)


def estimate_total_effective_deposit() -> int:
    context = (
        ContextBuilder().with_current_epoch_context().with_octant_rewards().build()
    )
    return context.current_epoch_context.octant_rewards.total_effective_deposit


def get_user_effective_deposit(user_address: str, epoch: int) -> int:
    context = ContextBuilder().with_users([user_address]).build()
    deposits_reader = UserDepositsReader()

    return deposits_reader.get_user_effective_deposit(context, user_address, epoch)


def estimate_user_effective_deposit(user_address: str) -> int:
    context = ContextBuilder().with_current_epoch_context().build()
    deposits_estimator = _build_deposits_estimator(context.current_epoch_context)

    return deposits_estimator.estimate_user_effective_deposit(
        context.current_epoch_context, user_address
    )


def _build_deposits_estimator(context: EpochContext) -> UserDepositsEstimator:
    start = context.epoch_details.start_sec
    end = context.epoch_details.end_sec
    event_generator = SubgraphEventsGenerator(epoch_start=start, epoch_end=end)
    user_deposits_calculator = UserDepositsCalculator(event_generator)

    return UserDepositsEstimator(
        user_deposits_calculator=user_deposits_calculator,
    )
