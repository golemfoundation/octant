from dataclasses import dataclass
from typing import Optional

from dataclass_wizard import JSONWizard
from flask import current_app as app

from app import exceptions
from app.extensions import db, epochs
from app.infrastructure import database
from app.infrastructure.database import finalized_epoch_snapshot
from app.legacy.core import merkle_tree
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
from app.legacy.core.proposals import get_finalized_rewards
from app.legacy.core.user import rewards as user_core_rewards


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
    all_individual_rewards: str


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


def snapshot_finalized_epoch() -> Optional[int]:
    current_epoch = epochs.get_current_epoch()
    finalized_epoch = epochs.get_finalized_epoch()
    app.logger.info(
        f"[*] Blockchain [current epoch: {current_epoch}] [finalized epoch: {finalized_epoch}] "
    )

    last_snapshot_epoch = get_last_finalized_snapshot()

    app.logger.info(f"[*] Most recent finalized snapshot: {last_snapshot_epoch}")

    if finalized_epoch <= last_snapshot_epoch:
        app.logger.info("[+] Finalized snapshots are up to date")
        return None

    pending_snapshot = database.pending_epoch_snapshot.get_by_epoch_num(finalized_epoch)

    if not pending_snapshot:
        raise exceptions.MissingSnapshot

    (
        proposal_rewards,
        proposal_rewards_sum,
        matched_rewards,
        patrons_rewards,
    ) = get_finalized_rewards(finalized_epoch, pending_snapshot)
    user_rewards, user_rewards_sum = user_core_rewards.get_all_claimed_rewards(
        finalized_epoch
    )
    all_rewards = user_rewards + proposal_rewards

    if len(all_rewards) > 0:
        database.rewards.add_all(finalized_epoch, all_rewards)
        rewards_merkle_tree = merkle_tree.build_merkle_tree(
            user_rewards + proposal_rewards
        )
        merkle_root = rewards_merkle_tree.root
        total_withdrawals = proposal_rewards_sum + user_rewards_sum
        leftover = (
            int(pending_snapshot.eth_proceeds)
            - int(pending_snapshot.operational_cost)
            - total_withdrawals
        )
        finalized_epoch_snapshot.add_snapshot(
            finalized_epoch,
            matched_rewards,
            patrons_rewards,
            leftover,
            merkle_root,
            total_withdrawals,
        )
    else:
        finalized_epoch_snapshot.add_snapshot(
            finalized_epoch,
            matched_rewards,
            patrons_rewards,
            pending_snapshot.total_rewards,
        )
    db.session.commit()

    return finalized_epoch


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
        all_individual_rewards=snapshot.all_individual_rewards,
    )


def get_finalized_snapshot(epoch: Optional[int]) -> FinalizedEpochSnapshot:
    snapshot = database.finalized_epoch_snapshot.get_by_epoch_num(epoch)

    return FinalizedEpochSnapshot(
        epoch=snapshot.epoch,
        matched_rewards=snapshot.matched_rewards,
        withdrawals_merkle_root=snapshot.withdrawals_merkle_root,
        total_withdrawals=snapshot.total_withdrawals,
    )
