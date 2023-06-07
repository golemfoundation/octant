from app import database

from decimal import Decimal


def get_user_budget(user_address: str, epoch: int) -> int:
    snapshot = database.epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None:
        return 0

    individual_share = Decimal(deposit.effective_deposit) / Decimal(
        snapshot.total_effective_deposit
    )
    return int(Decimal(snapshot.all_individual_rewards) * individual_share)
