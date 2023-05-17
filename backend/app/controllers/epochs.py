from typing import Optional

from flask import current_app as app

from app.contracts import epochs
from app.core import glm
from app.database import epoch_snapshot
from app.extensions import db, w3
from app.settings import config


def snapshot_previous_epoch() -> Optional[int]:
    current_epoch = epochs.get_current_epoch()
    app.logger.info(f"[+] Current epoch: {current_epoch}")
    previous_epoch = current_epoch - 1

    last_snapshot = epoch_snapshot.get_last_snapshot()
    last_snapshot_epoch = last_snapshot.epoch if last_snapshot is not None else 0
    app.logger.info(f"[+] Last db epoch: {last_snapshot_epoch}")

    if previous_epoch <= last_snapshot_epoch:
        return None

    glm_supply = glm.get_current_glm_supply()
    eth_proceeds = w3.eth.get_balance(config.WITHDRAWALS_TARGET_CONTRACT_ADDRESS)
    # TODO add total_ed
    total_effective_deposit = 0

    epoch_snapshot.add_snapshot(
        previous_epoch, glm_supply, eth_proceeds, total_effective_deposit
    )
    db.session.commit()
    app.logger.info(f"[+] Saved {previous_epoch} epoch snapshot to the DB")

    return previous_epoch
