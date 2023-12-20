from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.v2.context.context import (
    EpochContext,
    Context,
)
from app.v2.modules.user.deposits.api import UserDepositsService


@dataclass
class UserBudgetsService(ABC):
    user_deposits_service: UserDepositsService

    @abstractmethod
    def estimate_epoch_budget(
        self,
        context: EpochContext,
        lock_duration: int,
        glm_amount: int,
    ) -> int:
        pass


@dataclass
class UserBudgetsCalculator:
    current_user_budget_service: UserBudgetsService
    future_user_budget_service: UserBudgetsService

    def estimate_budget(
        self, context: Context, lock_duration_sec: int, glm_amount: int
    ) -> int:
        epoch_context = context.current_epoch_context
        remaining_lock_duration = lock_duration_sec
        budget = self.current_user_budget_service.estimate_epoch_budget(
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
            budget += (
                full_epochs_num
                * self.future_user_budget_service.estimate_epoch_budget(
                    epoch_context,
                    epoch_duration,
                    glm_amount,
                )
            )
            remaining_lock_duration = remaining_future_epoch_sec

        if remaining_lock_duration > 0:
            budget += self.future_user_budget_service.estimate_epoch_budget(
                epoch_context,
                remaining_lock_duration,
                glm_amount,
            )

        return budget
