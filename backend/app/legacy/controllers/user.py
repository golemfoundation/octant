from flask import current_app as app

from app.exceptions import InvalidSignature, UserNotFound, NotInDecisionWindow
from app.extensions import db
from app.modules.user.allocations import controller as allocations_controller
from app.legacy.core.user import patron_mode as patron_mode_core
from app.legacy.crypto.eth_sign import patron_mode as patron_mode_crypto


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
        allocations_controller.revoke_previous_allocation(user_address)
    except NotInDecisionWindow:
        app.logger.info(
            f"Not in allocation period. Skipped revoking previous allocation for user {user_address}"
        )

    db.session.commit()
    return patron_mode_status
