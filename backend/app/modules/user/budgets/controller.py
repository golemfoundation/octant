from typing import List

from app.context.epoch_state import EpochState
from app.context.manager import state_context, epoch_context
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.common.time import days_to_sec
from app.modules.common.validations.user_validations import (
    validate_estimate_budget_by_epochs_inputs,
    validate_estimate_budget_inputs,
)
from app.modules.dto import AccountFundsDTO
from app.modules.modules_factory.protocols import UserBudgets, UpcomingUserBudgets
from app.modules.registry import get_services
from app.modules.user.budgets import core


def get_budgets(epoch_num: int) -> List[AccountFundsDTO]:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service: UserBudgets = get_services(context.epoch_state).user_budgets_service
    budgets = service.get_all_budgets(context)
    return [AccountFundsDTO(k, v) for k, v in budgets.items()]


def get_budget(user_address: str, epoch_num: int) -> int:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service: UserBudgets = get_services(context.epoch_state).user_budgets_service
    return service.get_budget(context, user_address)


def get_upcoming_user_budget(user_address: str) -> int:
    context = state_context(EpochState.SIMULATED, with_block_range=True)
    service: UpcomingUserBudgets = get_services(EpochState.CURRENT).user_budgets_service

    return service.get_budget(context, user_address)


def estimate_budget(lock_duration_sec: int, glm_amount: int) -> int:
    current_context = state_context(EpochState.CURRENT)
    current_rewards_service = get_services(EpochState.CURRENT).octant_rewards_service
    current_rewards = current_rewards_service.get_octant_rewards(current_context)

    future_context = state_context(EpochState.FUTURE)
    future_rewards_service = get_services(EpochState.FUTURE).octant_rewards_service
    future_rewards = future_rewards_service.get_octant_rewards(future_context)

    return core.estimate_budget(
        current_context,
        future_context,
        current_rewards,
        future_rewards,
        lock_duration_sec,
        glm_amount,
    )


def estimate_budget_by_days(days: int, glm_amount: int) -> int:
    validate_estimate_budget_inputs(days, glm_amount)

    lock_duration_sec = days_to_sec(days)
    return estimate_budget(lock_duration_sec, glm_amount)


def estimate_epochs_budget(no_epochs: int, glm_amount: int) -> int:
    validate_estimate_budget_by_epochs_inputs(no_epochs, glm_amount)

    future_context = state_context(EpochState.FUTURE)
    future_rewards_service = get_services(EpochState.FUTURE).octant_rewards_service
    future_rewards = future_rewards_service.get_octant_rewards(future_context)

    epoch_duration = future_context.epoch_details.duration_sec

    return no_epochs * core.estimate_epoch_budget(
        future_context, future_rewards, epoch_duration, glm_amount
    )


def get_matching_fund(budget: int, leverage: float) -> int:
    return core.calculate_matching_fund(budget, leverage)
