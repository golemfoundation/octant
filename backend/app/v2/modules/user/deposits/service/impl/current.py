from dataclasses import dataclass

from app.v2.context.context import EpochContext
from app.v2.modules.user.deposits.service.impl.pre_pending import (
    PrePendingUserDepositsService,
)


@dataclass
class CurrentUserDepositsService(PrePendingUserDepositsService):
    def estimate_effective_deposit(
        self, context: EpochContext, glm_amount: int, lock_duration_sec: int
    ) -> int:
        events_generator = self.user_deposits_calculator.events_generator
        events_generator.create_user_events(
            glm_amount=glm_amount,
            lock_duration_sec=lock_duration_sec,
            epoch_remaining_duration_sec=context.epoch_details.remaining_sec,
        )
        user_deposit = self.user_deposits_calculator.calculate_effective_deposit(
            context
        )
        return user_deposit.effective_deposit
