from typing import List

from app.context.epoch_state import EpochState
from app.context.manager import state_context, epoch_context
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.dto import AccountFundsDTO
from app.modules.modules_factory.protocols import UserBudgets
from app.modules.registry import get_services
from app.modules.user.budgets import core


def get_budgets(epoch_num: int) -> List[AccountFundsDTO]:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service: UserBudgets = get_services(context.epoch_state).user_budgets_service
    budgets = service.get_all_budgets(context)
    return [AccountFundsDTO(k, v) for k, v in budgets.items()]


def estimate_budget(lock_duration_sec: int, glm_amount: int) -> int:
    current = state_context(EpochState.CURRENT)
    current_rewards = get_services(EpochState.CURRENT).octant_rewards_service

    future = state_context(EpochState.FUTURE)
    future_rewards = get_services(EpochState.FUTURE).octant_rewards_service

    return core.estimate_budget(
        current, future, current_rewards, future_rewards, lock_duration_sec, glm_amount
    )
