from flask import current_app as app

from app import database
from app.constants import BURN_ADDRESS
from app.crypto.account import Account
from app.extensions import glm, gnt


def get_current_glm_supply() -> int:
    return (
        glm.total_supply()
        + gnt.total_supply()
        - glm.balance_of(BURN_ADDRESS)
        - gnt.balance_of(BURN_ADDRESS)
    )


def transfer_claimed():
    account = Account.from_key(app.config["GLM_SENDER_PRIVATE_KEY"])
    claims = database.claims.get_by_claimed_true_and_nonce_gte(account.nonce)
    for claim in claims:
        app.logger.debug(f"Transferring GLM to user: {claim.address}")
        try:
            tx_hash = glm.transfer(claim.address, claim.claim_nonce)
            app.logger.info(
                f"GLM transferred to user: {claim.address}, tx: {tx_hash.hex()}"
            )
        except Exception as e:
            if "nonce too low" in str(e).lower():
                continue
            app.logger.error(f"Cannot transfer GLM: {e}")
