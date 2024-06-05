from app.infrastructure.database.models import IdentityCallsVerifications


def is_address_verified(address: str) -> bool:
    verification = IdentityCallsVerifications.query.filter_by(address=address).first()
    return verification is not None
