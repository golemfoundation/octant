import dataclasses
from dataclasses import dataclass
from dataclass_wizard import JSONWizard
from typing import Optional

from app.extensions import epochs

from app import exceptions
from app.controllers import snapshots as snapshots_controller
from app.core.rewards import rewards


@dataclass(frozen=True)
class EpochStats(JSONWizard):
    epoch: int
    # Data available to a pending epoch
    staking_proceeds: str
    total_effective_deposit: str
    total_rewards: str
    individual_rewards: str
    # Data available to a finalized epoch
    patrons_budget: Optional[str] = None
    matched_rewards: Optional[str] = None
    total_withdrawals: Optional[str] = None


def get_current_epoch() -> int:
    return epochs.get_current_epoch()


def get_epoch_stats(epoch: Optional[int]) -> EpochStats:
    epoch = (
        epoch
        if epoch is not None
        else snapshots_controller.get_last_finalized_snapshot()
    )

    last_pending_snapshot = snapshots_controller.get_last_pending_snapshot()

    last_finalized_snapshot = snapshots_controller.get_last_finalized_snapshot()

    if epoch > last_pending_snapshot:
        raise exceptions.InvalidEpochException(epoch)

    pending_snapshot = snapshots_controller.get_pending_snapshot(epoch)
    finalized_snapshot = (
        snapshots_controller.get_finalized_snapshot(epoch)
        if last_finalized_snapshot >= epoch
        else None
    )

    epoch_stats = EpochStats(
        epoch=epoch,
        staking_proceeds=pending_snapshot.eth_proceeds,
        total_effective_deposit=pending_snapshot.total_effective_deposit,
        individual_rewards=pending_snapshot.all_individual_rewards,
        total_rewards=pending_snapshot.total_rewards,
    )

    if finalized_snapshot is not None:
        patrons_budget = str(
            rewards.calculate_patrons_rewards(
                int(finalized_snapshot.matched_rewards),
                int(pending_snapshot.total_rewards),
                int(pending_snapshot.all_individual_rewards),
            )
        )

        epoch_stats = dataclasses.replace(
            epoch_stats,
            patrons_budget=patrons_budget,
            matched_rewards=finalized_snapshot.matched_rewards,
            total_withdrawals=finalized_snapshot.total_withdrawals,
        )

    return epoch_stats
