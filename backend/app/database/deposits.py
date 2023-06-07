from eth_utils import to_checksum_address

from app import db
from app.database.models import Deposit, User


def get_all_by_epoch(epoch):
    return Deposit.query.filter_by(epoch=epoch).all()


def get_by_user_address_and_epoch(user_address: str, epoch: int):
    query = Deposit.query.join(User)
    query = query.filter(
        User.address == to_checksum_address(user_address), Deposit.epoch == epoch
    )

    return query.one_or_none()


def add_deposit(epoch, user, effective_deposit, epoch_end_deposit):
    deposit = Deposit(
        epoch=epoch,
        user=user,
        effective_deposit=str(effective_deposit),
        epoch_end_deposit=str(epoch_end_deposit),
    )

    db.session.add(deposit)
