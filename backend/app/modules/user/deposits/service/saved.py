from dataclasses import dataclass

from app.context.manager import Context
from app.exceptions import EffectiveDepositNotFoundException
from app.infrastructure import database


@dataclass
class SavedUserDeposits:
    def get_user_effective_deposit(self, context: Context, user_address: str) -> int:
        epoch_num = context.epoch_details.epoch_num
        deposit = database.deposits.get_by_user_address_and_epoch(
            user_address, epoch_num
        )
        if deposit is None:
            raise EffectiveDepositNotFoundException(epoch_num, user_address)
        return int(deposit.effective_deposit)

    def get_total_effective_deposit(self, context: Context) -> int:
        epoch_num = context.epoch_details.epoch_num
        snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch_num)
        return int(snapshot.total_effective_deposit)
