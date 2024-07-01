from dataclasses import dataclass
from typing import Optional

from dataclass_wizard import JSONWizard
from flask import current_app as app

from app import exceptions
from app.extensions import epochs
from app.infrastructure import database
from app.legacy.core.epochs.epoch_snapshots import (
    has_pending_epoch_snapshot,
    has_finalized_epoch_snapshot,
    get_last_pending_snapshot,
    get_last_finalized_snapshot,
    pending_snapshot_status,
    finalized_snapshot_status,
    PendingSnapshotStatus,
    FinalizedSnapshotStatus,
)


@dataclass(frozen=True)
class EpochStatus(JSONWizard):
    is_current: bool
    is_pending: bool
    is_finalized: bool


@dataclass(frozen=True)
class PendingEpochSnapshot(JSONWizard):
    epoch: int
    eth_proceeds: str
    total_effective_deposit: str
    total_rewards: str
    vanilla_individual_rewards: str


@dataclass(frozen=True)
class FinalizedEpochSnapshot(JSONWizard):
    epoch: int
    matched_rewards: str
    withdrawals_merkle_root: str
    total_withdrawals: str


def get_pending_snapshot_status() -> PendingSnapshotStatus:
    current_epoch = epochs.get_current_epoch()
    last_snapshot_epoch = get_last_pending_snapshot()
    try:
        return pending_snapshot_status(current_epoch, last_snapshot_epoch)
    except exceptions.MissingSnapshot:
        app.logger.error(
            f"Database inconsistent? Current epoch {current_epoch}, last pending snapshot for epoch {last_snapshot_epoch}"
        )
        return PendingSnapshotStatus.ERROR


def get_finalized_snapshot_status() -> FinalizedSnapshotStatus:
    current_epoch = epochs.get_current_epoch()
    last_snapshot_epoch = get_last_finalized_snapshot()
    try:
        is_open = epochs.is_decision_window_open()
    except Exception:
        is_open = False
    try:
        return finalized_snapshot_status(current_epoch, last_snapshot_epoch, is_open)
    except exceptions.SnapshotTooEarly:
        app.logger.error(
            f"Database inconsistent? Current epoch {current_epoch}, last finalized snapshot for epoch {last_snapshot_epoch}, while voting window is open"
        )
        return FinalizedSnapshotStatus.ERROR
    except exceptions.MissingSnapshot:
        app.logger.error(
            f"Database inconsistent? Current epoch {current_epoch}, last finalized snapshot for epoch {last_snapshot_epoch}"
        )
        return FinalizedSnapshotStatus.ERROR


def get_epoch_status(epoch: int) -> EpochStatus:
    cur = epochs.get_current_epoch()
    pen = epochs.get_pending_epoch()
    fin = epochs.get_finalized_epoch()

    is_cur = False
    is_pen = False
    is_fin = False

    if epoch <= fin:
        is_fin = has_finalized_epoch_snapshot(epoch)
    elif epoch > cur:
        raise exceptions.EpochNotStartedYet
    elif epoch == cur:
        is_cur = True
    elif epoch == pen:
        # This case is somewhat special because even though the epoch is Pending in Blockchain,
        # we might not have snapshotted it yet
        is_pen = has_pending_epoch_snapshot(epoch)
    else:
        # Should this even happen?
        raise exceptions.InvalidEpoch()

    return EpochStatus(is_cur, is_pen, is_fin)


def get_pending_snapshot(epoch: Optional[int]) -> PendingEpochSnapshot:
    snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)

    return PendingEpochSnapshot(
        epoch=snapshot.epoch,
        eth_proceeds=snapshot.eth_proceeds,
        total_effective_deposit=snapshot.total_effective_deposit,
        total_rewards=snapshot.total_rewards,
        vanilla_individual_rewards=snapshot.vanilla_individual_rewards,
    )


def get_finalized_snapshot(epoch: Optional[int]) -> FinalizedEpochSnapshot:
    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(epoch)

    return FinalizedEpochSnapshot(
        epoch=snapshot.epoch,
        matched_rewards=snapshot.matched_rewards,
        withdrawals_merkle_root=snapshot.withdrawals_merkle_root,
        total_withdrawals=snapshot.total_withdrawals,
    )
