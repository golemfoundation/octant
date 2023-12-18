from app.v2.context.builder import ContextBuilder
from app.v2.modules.user.budgets.service import UserBudgetsEstimator
from app.v2.modules.user.deposits.events_generator import SimulatedEventsGenerator
from app.v2.modules.user.deposits.service import (
    UserDepositsCalculator,
    UserDepositsEstimator,
)


def estimate_budget(days: int, glm_amount: int) -> int:
    context = (
        ContextBuilder()
        .with_current_epoch_context()
        .with_future_epoch_context()
        .with_octant_rewards()
        .build()
    )
    start = context.current_epoch_context.epoch_details.start_sec
    end = context.current_epoch_context.epoch_details.end_sec

    events_generator = SimulatedEventsGenerator(epoch_start=start, epoch_end=end)
    user_deposits_calculator = UserDepositsCalculator(events_generator)
    user_deposits_estimator = UserDepositsEstimator(user_deposits_calculator)
    user_budget_estimator = UserBudgetsEstimator(
        user_deposits_estimator=user_deposits_estimator
    )

    return user_budget_estimator.estimate_budget(context, days, glm_amount)
