from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.core.user import budget, patron_mode
from app.core.user.tos import (
    has_user_agreed_to_terms_of_service,
    add_user_terms_of_service_consent,
)
from app.exceptions import RewardsException
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
    return patron_mode.get_patron_mode_status(user_address)


def toggle_patron_mode(user_address: str) -> bool:
    status = patron_mode.toggle_patron_mode(user_address)
    db.session.commit()
    return status
