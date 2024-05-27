from decimal import Decimal

from typing_extensions import deprecated

from app.infrastructure import database


@deprecated("Fetch budget from db instead")
def get_budget(user_address: str, epoch: int) -> int:
    snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None or Decimal(deposit.effective_deposit) == 0:
        return 0

    individual_share = Decimal(deposit.effective_deposit) / Decimal(
        snapshot.total_effective_deposit
    )

    return int(Decimal(snapshot.vanilla_individual_rewards) * individual_share)
