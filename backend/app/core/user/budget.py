from decimal import Decimal

from app import database
from app.database.models import PendingEpochSnapshot


def get_budget(user_address: str, epoch: int) -> int:
    snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None or Decimal(deposit.effective_deposit) == 0:
        return 0

    return _calculate_budget(
        deposit.effective_deposit,
        snapshot.total_effective_deposit,
        snapshot.all_individual_rewards,
    )


def get_patrons_budget(snapshot: PendingEpochSnapshot) -> int:
    patrons = database.user.get_all_patrons()
    patrons_rewards = 0
    for patron in patrons:
        patrons_rewards += get_budget(patron.address, snapshot.epoch)

    return patrons_rewards


def _calculate_budget(
    user_effective_deposit: int,
    total_effective_deposit: int,
    all_individual_rewards: int,
):
    individual_share = Decimal(user_effective_deposit) / Decimal(
        total_effective_deposit
    )

    return int(Decimal(all_individual_rewards) * individual_share)
