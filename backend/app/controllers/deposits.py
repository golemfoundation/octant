from app import database


def get_by_user_and_epoch(user_address: str, epoch: int) -> int:
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)
    if deposit is None:
        return 0
    return deposit.effective_deposit
