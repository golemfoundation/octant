from dataclasses import dataclass
from typing import List, Tuple

from flask import current_app as app

from app.v2.context.context import (
    EpochContext,
    Context,
)
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.budgets.core import (
    calculate_budgets,
    calculate_budget,
)
from app.v2.modules.user.deposits.service import (
    UserDepositsEstimator,
)


@dataclass
class UserBudgetsCalculator:
    def calculate_budgets(
        self,
        context: EpochContext,
        user_deposits: List[UserDeposit],
        total_effective_deposits: int,
        individual_rewards: int,
    ) -> List[Tuple[str, int]]:
        app.logger.debug(
            f"Calculating user budgets for epoch {context.epoch_details.epoch_no}"
        )
        budget_calculator = context.epoch_settings.user.budget

        return calculate_budgets(
            budget_calculator,
            user_deposits,
            total_effective_deposits,
            individual_rewards,
        )


@dataclass
class UserBudgetsEstimator:
    user_deposits_estimator: UserDepositsEstimator

    def estimate_budget(
        self, context: Context, lock_duration_sec: int, glm_amount: int
    ) -> int:
        epoch_context = context.current_epoch_context
        remaining_lock_duration = lock_duration_sec
        budget = self.estimate_epoch_budget(
            epoch_context,
            remaining_lock_duration,
            glm_amount,
        )
        remaining_lock_duration -= epoch_context.epoch_details.remaining_sec

        if remaining_lock_duration > 0:
            epoch_context = context.future_epoch_context
            epoch_duration = epoch_context.epoch_details.duration_sec
            full_epochs_num, remaining_future_epoch_sec = divmod(
                remaining_lock_duration, epoch_duration
            )
            budget += full_epochs_num * self.estimate_epoch_budget(
                epoch_context,
                epoch_duration,
                glm_amount,
            )
            remaining_lock_duration = remaining_future_epoch_sec

        if remaining_lock_duration > 0:
            budget += self.estimate_epoch_budget(
                epoch_context,
                remaining_lock_duration,
                glm_amount,
            )

        return budget

    def estimate_epoch_budget(
        self,
        context: EpochContext,
        lock_duration: int,
        glm_amount: int,
    ) -> int:
        budget_calculator = context.epoch_settings.user.budget
        total_effective_deposit = context.octant_rewards.total_effective_deposit
        individual_rewards = context.octant_rewards.individual_rewards
        user_effective_deposit = (
            self.user_deposits_estimator.estimate_effective_deposit(
                context, glm_amount, lock_duration
            )
        )
        return calculate_budget(
            budget_calculator,
            user_effective_deposit,
            total_effective_deposit,
            individual_rewards,
        )
