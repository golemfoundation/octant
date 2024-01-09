from typing import List

from app.constants import ZERO_ADDRESS
from app.context.context import Context
from app.context.epoch_details import EpochDetails
from app.engine.user.budget import UserBudgetPayload
from app.engine.user.effective_deposit import DepositEvent, EventType
from app.modules.user.common import calculate_effective_deposits


def simulate_user_events(
    epoch_details: EpochDetails, lock_duration: int, glm_amount: int
) -> List[DepositEvent]:
    end = epoch_details.end_sec
    remaining = epoch_details.remaining_sec
    user_events = [
        DepositEvent(
            user=ZERO_ADDRESS,
            type=EventType.LOCK,
            timestamp=end - remaining,
            amount=glm_amount,
            deposit_before=0,
        )
    ]
    if lock_duration < remaining:
        user_events.append(
            DepositEvent(
                user=ZERO_ADDRESS,
                type=EventType.UNLOCK,
                timestamp=end - remaining + lock_duration,
                amount=glm_amount,
                deposit_before=glm_amount,
            )
        )
    return user_events


def estimate_epoch_budget(
    context: Context,
    lock_duration: int,
    glm_amount: int,
) -> int:
    epoch_details = context.epoch_details
    epoch_settings = context.epoch_settings
    rewards = context.octant_rewards
    events = {
        ZERO_ADDRESS: simulate_user_events(epoch_details, lock_duration, glm_amount)
    }
    user_effective_deposits, _ = calculate_effective_deposits(
        epoch_details, epoch_settings, events
    )
    effective_deposit = (
        user_effective_deposits[0].effective_deposit if user_effective_deposits else 0
    )

    return epoch_settings.user.budget.calculate_budget(
        UserBudgetPayload(
            user_effective_deposit=effective_deposit,
            total_effective_deposit=rewards.total_effective_deposit,
            all_individual_rewards=rewards.individual_rewards,
        )
    )


def estimate_budget(
    current_context: Context,
    future_context: Context,
    lock_duration_sec: int,
    glm_amount: int,
) -> int:
    remaining_lock_duration = lock_duration_sec
    budget = estimate_epoch_budget(
        current_context,
        remaining_lock_duration,
        glm_amount,
    )
    remaining_lock_duration -= current_context.epoch_details.remaining_sec

    if remaining_lock_duration > 0:
        epoch_duration = future_context.epoch_details.duration_sec
        full_epochs_num, remaining_future_epoch_sec = divmod(
            remaining_lock_duration, epoch_duration
        )
        budget += full_epochs_num * estimate_epoch_budget(
            future_context,
            epoch_duration,
            glm_amount,
        )
        remaining_lock_duration = remaining_future_epoch_sec

    if remaining_lock_duration > 0:
        budget += estimate_epoch_budget(
            future_context,
            remaining_lock_duration,
            glm_amount,
        )

    return budget
