from dataclasses import dataclass
from typing import Tuple, List

from app import database
from app.exceptions import EffectiveDepositNotFoundException
from app.v2.context.context import Context
from app.v2.engine.user.effective_deposit import UserDeposit


@dataclass
class SavedUserDeposits:
    def get_all_effective_deposits(
        self, context: Context
    ) -> Tuple[List[UserDeposit], int]:
        # TODO implement
        ...

    def get_total_effective_deposit(self, context: Context) -> int:
        # TODO implement
        ...

    def get_user_effective_deposit(self, context: Context, user_address: str) -> int:
        epoch_num = context.epoch_details.epoch_num
        deposit = database.deposits.get_by_user_address_and_epoch(
            user_address, epoch_num
        )
        if deposit is None:
            raise EffectiveDepositNotFoundException(epoch_num, user_address)
        return int(deposit.effective_deposit)
