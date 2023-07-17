from typing import List

from app import database
from app.core.common import UserDeposit
from app.exceptions import EffectiveDepositNotFound


def get_by_user_and_epoch(user_address: str, epoch: int) -> UserDeposit:
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)
    if deposit is None:
        raise EffectiveDepositNotFound(user_address, epoch)
    return deposit
