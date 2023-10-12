from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.core.user import budget, patron_mode as patron_mode_core
from app.core.user.tos import (
    has_user_agreed_to_terms_of_service,
    add_user_terms_of_service_consent,
)
from app.controllers import allocations as allocations_controller
from app.crypto.eth_sign import patron_mode as patron_mode_crypto
from app.exceptions import RewardsException, InvalidSignature
from app.extensions import db

MAX_DAYS_TO_ESTIMATE_BUDGET = 365250


def get_user_terms_of_service_consent_status(user_address: str) -> bool:
    return has_user_agreed_to_terms_of_service(user_address)


def post_user_terms_of_service_consent(user_address: str, signature: str, user_ip: str):
    add_user_terms_of_service_consent(user_address, signature, user_ip)

    db.session.commit()


def get_budget(user_address: str, epoch: int) -> int:
    return budget.get_budget(user_address, epoch)


def estimate_budget(days: int, glm_amount: int) -> int:
    if days < 0 or days > MAX_DAYS_TO_ESTIMATE_BUDGET:
        raise RewardsException(
            f"Time to estimate must be between 0 and {MAX_DAYS_TO_ESTIMATE_BUDGET} days",
            400,
        )
    if glm_amount < 0 or glm_amount > GLM_TOTAL_SUPPLY_WEI:
        raise RewardsException(
            f"Glm amount must be between 0 and {GLM_TOTAL_SUPPLY_WEI}", 400
        )

    return budget.estimate_budget(days, glm_amount)


def get_patron_mode_status(user_address: str) -> bool:
    return patron_mode_core.get_patron_mode_status(user_address)


def toggle_patron_mode(user_address: str, signature: str) -> bool:
    patron_mode_status = patron_mode_core.get_patron_mode_status(user_address)

    if not patron_mode_crypto.verify(user_address, not patron_mode_status, signature):
        raise InvalidSignature(user_address, signature)

    patron_mode_status = patron_mode_core.toggle_patron_mode(user_address)

    allocations_controller.revoke_previous_user_allocation(user_address)

    db.session.commit()
    return patron_mode_status
