from app.core.user import (
    has_user_agreed_to_terms_of_service,
    add_user_terms_of_service_consent,
)

from app.extensions import db


def get_user_terms_of_service_consent_status(user: str) -> bool:
    return has_user_agreed_to_terms_of_service(user)


def post_user_terms_of_service_consent(user: str, signature: str, user_ip: str):
    add_user_terms_of_service_consent(user, signature, user_ip)

    db.session.commit()
