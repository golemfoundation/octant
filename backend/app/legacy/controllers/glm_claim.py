from flask import current_app as app

from app.exceptions import GlmClaimed, NotEligibleToClaimGLM
from app.extensions import db
from app.infrastructure import database
from app.infrastructure.database.models import EpochZeroClaim
from app.legacy.core import claims as claims_core
from app.legacy.crypto.eip712 import recover_address, build_claim_glm_eip712_data


def claim(signature: str):
    eip712_data = build_claim_glm_eip712_data()
    user_address = recover_address(eip712_data, signature)
    nonce = claims_core.get_next_claim_nonce()
    app.logger.info(f"User: {user_address} is claiming GLMs with a nonce: {nonce}")

    user_claim = check(user_address)

    user_claim.claimed = True
    user_claim.claim_nonce = nonce
    db.session.commit()


def check(address: str) -> EpochZeroClaim:
    user_claim = database.claims.get_by_address(address)

    if user_claim is None:
        raise NotEligibleToClaimGLM(address)

    if user_claim.claimed:
        raise GlmClaimed(address)

    return user_claim
