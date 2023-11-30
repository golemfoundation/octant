from decimal import Decimal

from app.database.models import PendingEpochSnapshot, Deposit
from app.v2.modules.user.core.budget import calculate_budget


def get_budget(snapshot: PendingEpochSnapshot, deposit: Deposit) -> int:
    if snapshot is None or deposit is None or Decimal(deposit.effective_deposit) == 0:
        return 0

    return calculate_budget(
        deposit.effective_deposit,
        snapshot.total_effective_deposit,
        snapshot.all_individual_rewards,
    )
