from typing import Tuple

from app.core.deposits.events import EventGenerator
from app.v2.context.context import ContextBuilder
from app.v2.modules.user.deposits.service import (
    UserDepositsEstimator,
    UserDepositsCalculator,
)


def estimate_total_effective_deposit() -> Tuple[int, int]:
    context = ContextBuilder().with_current_epoch_context().build()
    current_context = context.current_epoch_context
    start = current_context.epoch_details.start_sec
    end = current_context.epoch_details.end_sec
    event_generator = EventGenerator(epoch_start=start, epoch_end=end)
    user_deposits_calculator = UserDepositsCalculator(event_generator)
    deposits_estimator = UserDepositsEstimator(
        user_deposits_calculator=user_deposits_calculator,
    )

    total = deposits_estimator.estimate_total_effective_deposit(current_context)

    return context.current_epoch, total
