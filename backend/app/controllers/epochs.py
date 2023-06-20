from dataclasses import dataclass
from dataclass_wizard import JSONWizard
from typing import Optional

from flask import current_app as app

from app.contracts import epochs
from app.core import glm
from app.core.deposits import update_db_deposits, calculate_locked_ratio
from app.core.epochs import is_epoch_snapshotted
from app.core.rewards import calculate_total_rewards, calculate_all_individual_rewards
from app.database import epoch_snapshot
from app import exceptions
from app.extensions import db, w3
from app.settings import config


@dataclass(frozen=True)
class EpochStatus(JSONWizard):
    is_current: bool
    is_pending: bool
    is_finalized: bool


def snapshot_previous_epoch() -> Optional[int]:
    current_epoch = epochs.get_current_epoch()
    app.logger.info(f"[+] Current epoch: {current_epoch}")
    pending_epoch = epochs.get_pending_epoch()
    app.logger.info(f"[+] Pending epoch: {pending_epoch}")

    try:
        last_snapshot = epoch_snapshot.get_last_snapshot()
        last_snapshot_epoch = last_snapshot.epoch
    except exceptions.MissingSnapshot:
        last_snapshot_epoch = 0

    app.logger.info(f"[+] Last db epoch: {last_snapshot_epoch}")

    if pending_epoch <= last_snapshot_epoch:
        return None

    glm_supply = glm.get_current_glm_supply()
    eth_proceeds = w3.eth.get_balance(config.WITHDRAWALS_TARGET_CONTRACT_ADDRESS)
    total_effective_deposit = update_db_deposits(pending_epoch)
    locked_ratio = calculate_locked_ratio(total_effective_deposit, glm_supply)
    total_rewards = calculate_total_rewards(eth_proceeds, locked_ratio)
    all_individual_rewards = calculate_all_individual_rewards(
        eth_proceeds, locked_ratio
    )

    epoch_snapshot.add_snapshot(
        pending_epoch,
        glm_supply,
        eth_proceeds,
        total_effective_deposit,
        locked_ratio,
        total_rewards,
        all_individual_rewards,
    )
    db.session.commit()
    app.logger.info(f"[+] Saved {pending_epoch} epoch snapshot to the DB")

    return pending_epoch


def get_epoch_status(epoch: int) -> EpochStatus:
    cur = epochs.get_current_epoch()
    pen = epochs.get_pending_epoch()
    fin = epochs.get_finalized_epoch()

    is_cur = False
    is_pen = False
    is_fin = False

    if epoch <= fin:
        is_fin = is_epoch_snapshotted(epoch)
    elif epoch > cur:
        raise exceptions.EpochNotStartedYet
    elif epoch == cur:
        is_cur = True
    elif epoch == pen:
        # This case is somewhat special because even though the epoch is Pending in Blockchain,
        # we might not have snapshotted it yet
        is_pen = is_epoch_snapshotted(epoch)
    else:
        # Should this even happen?
        raise exceptions.InvalidEpoch()

    return EpochStatus(is_cur, is_pen, is_fin)
