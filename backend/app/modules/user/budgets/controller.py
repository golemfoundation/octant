from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.user.budgets.service import service


def estimate_budget(lock_duration_sec: int, glm_amount: int) -> int:
    current = state_context(EpochState.CURRENT)
    future = state_context(EpochState.FUTURE)
    return service.estimate_budget(current, future, lock_duration_sec, glm_amount)
