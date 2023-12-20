from dataclasses import dataclass
from typing import Tuple, List

from app import database
from app.exceptions import EffectiveDepositNotFoundException
from app.v2.context.context import EpochContext
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.deposits.api import UserDepositsService


@dataclass
class DefaultUserDepositsService(UserDepositsService):
    def get_all_effective_deposits(
        self, context: EpochContext
    ) -> Tuple[List[UserDeposit], int]:
        raise NotImplementedError()

    def get_total_effective_deposit(self, context: EpochContext) -> int:
        raise NotImplementedError()

    def get_user_effective_deposit(
        self, context: EpochContext, user_address: str
    ) -> int:
        deposit = database.deposits.get_by_user_address_and_epoch(
            user_address, context.epoch_num
        )
        if deposit is None:
            raise EffectiveDepositNotFoundException(context.epoch_num, user_address)
        return deposit.effective_deposit

    def estimate_effective_deposit(
        self, context: EpochContext, glm_amount: int, lock_duration_sec: int
    ) -> int:
        raise NotImplementedError()
