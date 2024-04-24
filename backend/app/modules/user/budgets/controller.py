from decimal import Decimal
from typing import List

from app.context.epoch_state import EpochState
from app.context.manager import state_context, epoch_context
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.dto import AccountFundsDTO
from app.modules.modules_factory.protocols import UserBudgets
from app.modules.registry import get_services
from app.modules.user.budgets import core

from app.extensions import epochs


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


def get_current_budget(user_address: str) -> int:
    # TBC:
    # - did i assume correctly that when AW is open, get_current_epoch is set to current_epoch_with_aw + 1?
    # - did i assume correctly that we should use pending_snapshot for getting current budget?
    # - did i assume correctly that APR is set only to the next epoch after current AW when we don't simulate pending_snapshot?

    epoch = epochs.get_current_epoch()  # actually it returns "4" when AW is open
    is_aw_open = epochs.is_decision_window_open()
    print("CURRENT EPOCH", epoch, flush=True)
    print("IS DECISION WINDOW OPEN", epochs.is_decision_window_open(), flush=True)
    context = epoch_context(epoch, is_simulated=True)

    if not is_aw_open:
        # compute in a standard way
        service = get_services(context.epoch_state).simulated_pending_snapshot_service
        simulated_snapshot = service.simulate_pending_epoch_snapshot(context)
        value = core.get_current_budget(user_address, simulated_snapshot.user_budgets)
        print("DEBUG", value, flush=True)

    else:
        # compute in a different way with apr
        last_epoch = (
            epoch - 1
        )  # when AW is open and it returns 4, we need to go back to the last_epoch
        actual_budget = get_budget(user_address, last_epoch)
        epoch_days = state_context(last_epoch).epoch_details.duration_days
        apr = Decimal(
            "3.8"
        )  # here we set APR because we can't simulate pending_snapshot for epoch that hasn't started yet
        ratio = Decimal(epoch_days / 365)
        value = ratio * apr * actual_budget
        print("DEBUG 2", value, flush=True)

    return value
    # context = state_context(EpochState.CURRENT)


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
