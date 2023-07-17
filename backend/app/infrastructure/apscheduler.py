from flask import current_app as app

from app.core import vault
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
