from app.exceptions import DuplicateConsent, InvalidSignature
from app.infrastructure import database
from app.legacy.crypto.eth_sign import terms_and_conditions_consent


def has_user_agreed_to_terms_of_service(user_address: str) -> bool:
    consent = database.user_consents.get_last_by_address(user_address)
    return consent is not None


def add_user_terms_of_service_consent(
    user_address: str, consent_signature: str, ip_address: str
):
    if has_user_agreed_to_terms_of_service(user_address):
        raise DuplicateConsent(user_address)

    if not terms_and_conditions_consent.verify(user_address, consent_signature):
        raise InvalidSignature(user_address, consent_signature)

    database.user_consents.add_consent(user_address, ip_address)
