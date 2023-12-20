from dataclasses import dataclass
from typing import Tuple, List

from app.v2.context.context import EpochContext
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.deposits.service.impl.default import DefaultUserDepositsService


@dataclass
class PrePendingUserDepositsService(DefaultUserDepositsService):
    def get_all_effective_deposits(
        self, context: EpochContext
    ) -> Tuple[List[UserDeposit], int]:
        return self.user_deposits_calculator.calculate_all_effective_deposits(context)

    def get_total_effective_deposit(self, context: EpochContext) -> int:
        _, total = self.user_deposits_calculator.calculate_all_effective_deposits(
            context
        )
        return total

    def get_user_effective_deposit(
        self, context: EpochContext, user_address: str
    ) -> int:
        user_deposit = self.user_deposits_calculator.calculate_effective_deposit(
            context, user_address
        )
        return user_deposit.effective_deposit
