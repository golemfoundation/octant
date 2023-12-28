from app.context.context import Context
from app.modules.user.budgets import core


def estimate_budget(
    current_context: Context,
    future_context: Context,
    lock_duration_sec: int,
    glm_amount: int,
) -> int:
    return core.estimate_budget(
        current_context, future_context, lock_duration_sec, glm_amount
    )
