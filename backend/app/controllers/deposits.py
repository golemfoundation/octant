from flask import current_app as app

from app.controllers import epochs as epochs_controller
from app.core.deposits import deposits as deposits_core
from app.infrastructure import graphql
from app.database import deposits as deposits_db
from app.settings import config


def get_by_user_and_epoch(user_address: str, epoch: int) -> int:
    current_epoch = epochs_controller.get_current_epoch()

    if current_epoch == 1 and epoch == 1:
        details = graphql.epochs.get_epoch_by_number(epoch)
        start, end = int(details["fromTs"]), int(details["toTs"])
        return deposits_core.get_estimated_effective_deposit(start, end, user_address)

    deposit = deposits_db.get_by_user_address_and_epoch(user_address, epoch)
    if deposit is None:
        return 0
    return deposit.effective_deposit
