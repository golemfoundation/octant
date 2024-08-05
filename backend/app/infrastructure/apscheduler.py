from flask import current_app as app

from app.legacy.core import glm
from app.legacy.core import vault
from app.extensions import scheduler


@scheduler.task(
    "interval",
    id="vault-confirm-withdrawals",
    seconds=15,
    misfire_grace_time=900,
    max_instances=1,
)
def vault_confirm_withdrawals():
    with scheduler.app.app_context():
        if app.config["VAULT_CONFIRM_WITHDRAWALS_ENABLED"]:
            app.logger.debug("Confirming withdrawals in Vault contract...")
            vault.confirm_withdrawals()


@scheduler.task(
    "interval", id="glm-transfer", seconds=60, misfire_grace_time=900, max_instances=1
)
def glm_transfer():
    with scheduler.app.app_context():
        if app.config["GLM_CLAIM_ENABLED"]:
            app.logger.debug("Transferring claimed GLMs...")
            glm.transfer_claimed()
