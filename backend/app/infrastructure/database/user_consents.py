from eth_utils import to_checksum_address

from app.infrastructure.database.models import User, UserConsents
from app.infrastructure.database.user import get_or_add_user
from app.extensions import db


def get_last_by_address(user_address: str):
    return (
        UserConsents.query.join(User)
        .filter(User.address == to_checksum_address(user_address))
        .order_by(UserConsents.created_at.desc())
        .first()
    )


def add_consent(user_address: str, user_ip_address: str):
    user = get_or_add_user(user_address)

    consent = UserConsents(ip=user_ip_address)
    user.consents.append(consent)
    db.session.add(user)
