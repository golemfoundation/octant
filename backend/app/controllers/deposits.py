from app.controllers import epochs as epochs_controller
from app.core.deposits import deposits as deposits_core
from app.database import deposits as deposits_db


def get_by_user_and_epoch(user_address: str, epoch: int) -> int:
    current_epoch = epochs_controller.get_current_epoch()

    if current_epoch == 1 and epoch == 1:
        # TODO fetch these timestamps from subgraph during implementation of OCT-859
        start, end = 1691510400, 1697731200
        return deposits_core.get_estimated_effective_deposit(start, end, user_address)

    deposit = deposits_db.get_by_user_address_and_epoch(user_address, epoch)
    if deposit is None:
        return 0
    return deposit.effective_deposit
