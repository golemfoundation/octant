from typing import List, Optional, Dict

from eth_utils import to_checksum_address

from app import db
from app.infrastructure import database
from app.infrastructure.database.models import Deposit, User
from app.engine.user.effective_deposit import UserDeposit


def get_all_by_epoch(epoch: int) -> Dict[str, Deposit]:
    deposits = Deposit.query.filter_by(epoch=epoch).all()
    return {deposit.user.address: deposit for deposit in deposits}


def get_by_user_address_and_epoch(user_address: str, epoch: int) -> Optional[Deposit]:
    query = Deposit.query.join(User)
    query = query.filter(
        User.address == to_checksum_address(user_address), Deposit.epoch == epoch
    )

    return query.one_or_none()


def get_by_users_addresses_and_epoch(
    users_addresses: List[str], epoch: int
) -> Dict[str, Deposit]:
    query = Deposit.query.join(User)
    query = query.filter(User.address.in_(users_addresses), Deposit.epoch == epoch)
    deposits = query.all()
    return {deposit.user.address: deposit for deposit in deposits}


def add(epoch: int, user: User, effective_deposit: int, epoch_end_deposit: int):
    deposit = Deposit(
        epoch=epoch,
        user=user,
        effective_deposit=str(effective_deposit),
        epoch_end_deposit=str(epoch_end_deposit),
    )

    db.session.add(deposit)


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
