from app import database
from app.settings import config


def get_next_claim_nonce() -> int:
    last_nonce = database.claims.get_highest_claim_nonce()
    return config.GLM_SENDER_NONCE if last_nonce is None else last_nonce + 1
