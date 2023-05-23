from app import db
from app.database.models import Deposit


def get_all_by_epoch(epoch):
    return Deposit.query.filter_by(epoch=epoch).all()


def add_deposit(epoch, user, effective_deposit, epoch_end_deposit):
    deposit = Deposit(
        epoch=epoch,
        user=user,
        effective_deposit=str(effective_deposit),
        epoch_end_deposit=str(epoch_end_deposit),
    )

    db.session.add(deposit)
