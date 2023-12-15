from app.core.deposits.events import EventGenerator
from app.v2.context.context import ContextBuilder, Context
from app.v2.modules.user.deposits.service import (
    UserDepositsEstimator,
    UserDepositsCalculator,
)


def estimate_total_effective_deposit() -> int:
    context = ContextBuilder().with_current_epoch_context().build()
    deposits_estimator = _build_deposits_estimator(context)

    return deposits_estimator.estimate_total_effective_deposit(
        context.current_epoch_context
    )


def estimate_user_effective_deposit(user_address: str) -> int:
    context = ContextBuilder().with_current_epoch_context().build()
    deposits_estimator = _build_deposits_estimator(context)

    return deposits_estimator.estimate_user_effective_deposit(
        context.current_epoch_context, user_address
    )


def _build_deposits_estimator(context: Context) -> UserDepositsEstimator:
    current_context = context.current_epoch_context
    start = current_context.epoch_details.start_sec
    end = current_context.epoch_details.end_sec
    event_generator = EventGenerator(epoch_start=start, epoch_end=end)
    user_deposits_calculator = UserDepositsCalculator(event_generator)
    return UserDepositsEstimator(
        user_deposits_calculator=user_deposits_calculator,
    )
