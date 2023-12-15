from app.controllers import epochs as epochs_controller
from app.database import deposits as deposits_db
from app.exceptions import InvalidEpochException, EffectiveDepositNotFoundException


def get_user_effective_deposit_by_epoch(user_address: str, epoch: int) -> int:
    current_epoch = epochs_controller.get_current_epoch()
    if epoch >= current_epoch:
        raise InvalidEpochException(epoch)
    deposit = deposits_db.get_by_user_address_and_epoch(user_address, epoch)
    if deposit is None:
        raise EffectiveDepositNotFoundException(epoch, user_address)
    return deposit.effective_deposit
