from typing import List, Dict

from app import database
from app.database.models import Deposit
from app.extensions import db
from app.v2.engine.user.effective_deposit import UserDeposit


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


def get_all_by_epoch(epoch: int) -> Dict[str, Deposit]:
    deposits = Deposit.query.filter_by(epoch=epoch).all()
    return {deposit.user.address: deposit for deposit in deposits}
