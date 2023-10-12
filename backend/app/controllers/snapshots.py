from dataclasses import dataclass
from typing import Optional

from dataclass_wizard import JSONWizard
from flask import current_app as app

from app import exceptions, database
from app.core import merkle_tree
from app.core.deposits.deposits import get_users_deposits, calculate_locked_ratio
from app.core.epochs.epoch_snapshots import (
    has_pending_epoch_snapshot,
    has_finalized_epoch_snapshot,
    get_last_pending_snapshot,
    get_last_finalized_snapshot,
    pending_snapshot_status,
    finalized_snapshot_status,
    PendingSnapshotStatus,
    FinalizedSnapshotStatus,
)
from app.core.proposals import get_proposal_rewards_above_threshold
from app.core.rewards.rewards import (
    calculate_total_rewards,
    calculate_all_individual_rewards,
)
from app.core.user import rewards as user_core_rewards
from app.database import pending_epoch_snapshot, finalized_epoch_snapshot
from app.extensions import db, w3, epochs
from app.constants import GLM_TOTAL_SUPPLY_WEI


@dataclass(frozen=True)
class EpochStatus(JSONWizard):
    is_current: bool
    is_pending: bool
    is_finalized: bool


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


def snapshot_pending_epoch() -> Optional[int]:
    current_epoch = epochs.get_current_epoch()
    pending_epoch = epochs.get_pending_epoch()
    app.logger.info(
        f"[*] Blockchain [current epoch: {current_epoch}] [pending epoch: {pending_epoch}] "
    )

    last_snapshot_epoch = get_last_pending_snapshot()

    app.logger.info(f"[*] Most recent pending snapshot: {last_snapshot_epoch}")

    if pending_epoch <= last_snapshot_epoch:
        app.logger.info("[+] Pending snapshots are up to date")
        return None

    eth_proceeds = w3.eth.get_balance(app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"])
    user_deposits, total_effective_deposit = get_users_deposits(pending_epoch)
    locked_ratio = calculate_locked_ratio(total_effective_deposit, GLM_TOTAL_SUPPLY_WEI)
    total_rewards = calculate_total_rewards(eth_proceeds, locked_ratio, pending_epoch)
    all_individual_rewards = calculate_all_individual_rewards(
        eth_proceeds, locked_ratio, pending_epoch
    )

    database.deposits.add_all(pending_epoch, user_deposits)
    pending_epoch_snapshot.add_snapshot(
        pending_epoch,
        eth_proceeds,
        total_effective_deposit,
        locked_ratio,
        total_rewards,
        all_individual_rewards,
    )
    db.session.commit()

    return pending_epoch


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

    (
        proposal_rewards,
        proposal_rewards_sum,
        matched_rewards,
    ) = get_proposal_rewards_above_threshold(finalized_epoch)
    user_rewards, user_rewards_sum = user_core_rewards.get_claimed_rewards(
        finalized_epoch
    )
    all_rewards = user_rewards + proposal_rewards

    if len(all_rewards) > 0:
        database.rewards.add_all(finalized_epoch, all_rewards)
        rewards_merkle_tree = merkle_tree.build_merkle_tree(
            user_rewards + proposal_rewards
        )
        merkle_root = rewards_merkle_tree.root
        finalized_epoch_snapshot.add_snapshot(
            finalized_epoch,
            matched_rewards,
            merkle_root,
            proposal_rewards_sum + user_rewards_sum,
        )
    else:
        finalized_epoch_snapshot.add_snapshot(finalized_epoch, matched_rewards)
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
