from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.registry import get_services
from app.modules.user.budgets import core


def estimate_budget(lock_duration_sec: int, glm_amount: int) -> int:
    current = state_context(EpochState.CURRENT)
    current_rewards = get_services(EpochState.CURRENT).octant_rewards_service

    future = state_context(EpochState.FUTURE)
    future_rewards = get_services(EpochState.FUTURE).octant_rewards_service

    return core.estimate_budget(
        current, future, current_rewards, future_rewards, lock_duration_sec, glm_amount
    )
