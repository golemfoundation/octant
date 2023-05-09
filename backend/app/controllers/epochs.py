from flask import current_app as app
from app.contracts import epochs
from app.core import glm
from app.extensions import db
from app.database import models, epochs as db_epochs


def snapshot_previous_epoch() -> int:
    current_onchain_epoch = epochs.get_current_epoch()
    app.logger.info(f"[+] Current epoch: {current_onchain_epoch}")

    previous_onchain_epoch = current_onchain_epoch - 1

    last_saved_epoch = db_epochs.get_last_snapshot()
    app.logger.info(f"[+] Last db epoch: {last_saved_epoch}")

    if previous_onchain_epoch <= last_saved_epoch:
        return 0

    glm_supply = glm.get_current_glm_supply()

    entry = models.OnchainSnapshot(
        epoch_no=previous_onchain_epoch,
        glm_supply=glm_supply,
    )
    db.session.add(entry)
    db.session.commit()
    app.logger.info(f"[+] Saved {previous_onchain_epoch} epoch snapshot to the DB")

    return previous_onchain_epoch
