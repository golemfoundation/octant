from app.v2.context.builder import ContextBuilder
from app.v2.modules.user.budgets.service.factory import get_user_budgets_calculator


def estimate_budget(lock_duration_sec: int, glm_amount: int) -> int:
    context = (
        ContextBuilder()
        .with_current_epoch_context()
        .with_future_epoch_context()
        .with_octant_rewards()
        .build()
    )

    service = get_user_budgets_calculator(context)
    return service.estimate_budget(context, lock_duration_sec, glm_amount)
