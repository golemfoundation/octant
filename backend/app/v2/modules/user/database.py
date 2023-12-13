from typing import List

from app.extensions import db

from app import database
from app.core.common import UserDeposit
from app.database.models import Deposit


def save_deposits(epoch: int, deposits: List[UserDeposit]):
    for d in deposits:
        user = database.user.get_or_add_user(d.user_address)
        user.deposits.append(
            Deposit(
                epoch=epoch,
                effective_deposit=str(d.effective_deposit),
                epoch_end_deposit=str(d.deposit),
            )
        )
        db.session.add(user)
