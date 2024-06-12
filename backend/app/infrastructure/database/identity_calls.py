from app import db
from app.infrastructure.database.models import IdentityCallsVerifications


def add_to_whitelist(user_address: str):
    verification = IdentityCallsVerifications(address=user_address)
    db.session.add(verification)


def is_address_whitelisted(address: str) -> bool:
    query = IdentityCallsVerifications.query.filter_by(address=address)
    return db.session.query(query.exists()).scalar()
