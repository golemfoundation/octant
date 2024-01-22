from typing import List
from flask import current_app as app

from app.exceptions import InvalidSignature, UserNotFound, NotInDecisionWindow
from app.extensions import db
from app.infrastructure import database
from app.legacy.controllers import allocations as allocations_controller
from app.legacy.core.user import budget, patron_mode as patron_mode_core
from app.legacy.core.user.tos import (
    has_user_agreed_to_terms_of_service,
    add_user_terms_of_service_consent,
)
from app.legacy.crypto.eth_sign import patron_mode as patron_mode_crypto

MAX_DAYS_TO_ESTIMATE_BUDGET = 365250


def get_user_terms_of_service_consent_status(user_address: str) -> bool:
    return has_user_agreed_to_terms_of_service(user_address)


def post_user_terms_of_service_consent(user_address: str, signature: str, user_ip: str):
    add_user_terms_of_service_consent(user_address, signature, user_ip)

    db.session.commit()


def get_budget(user_address: str, epoch: int) -> int:
    return budget.get_budget(user_address, epoch)


def get_all_users() -> List[str]:
    return [user.address for user in database.user.get_all()]


def get_patron_mode_status(user_address: str) -> bool:
    try:
        return patron_mode_core.get_patron_mode_status(user_address)
    except UserNotFound:
        return False


def toggle_patron_mode(user_address: str, signature: str) -> bool:
    patron_mode_status = patron_mode_core.get_patron_mode_status(user_address)

    if not patron_mode_crypto.verify(user_address, not patron_mode_status, signature):
        raise InvalidSignature(user_address, signature)

    patron_mode_status = patron_mode_core.toggle_patron_mode(user_address)

    try:
        allocations_controller.revoke_previous_user_allocation(user_address)
    except NotInDecisionWindow:
        app.logger.info(
            f"Not in allocation period. Skipped revoking previous allocation for user {user_address}"
        )

    db.session.commit()
    return patron_mode_status
