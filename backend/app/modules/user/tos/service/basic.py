from app.extensions import db
from app.context.manager import Context
from app.exceptions import DuplicateConsent, InvalidSignature
from app.infrastructure import database
from app.modules.user.tos.core import verify_signature
from app.pydantic import Model


class BasicUserTos(Model):
    def has_user_agreed_to_terms_of_service(
        self, _: Context, user_address: str
    ) -> bool:
        consent = database.user_consents.get_last_by_address(user_address)
        return consent is not None

    def add_user_terms_of_service_consent(
        self,
        context: Context,
        user_address: str,
        consent_signature: str,
        ip_address: str,
    ):
        if self.has_user_agreed_to_terms_of_service(context, user_address):
            raise DuplicateConsent(user_address)

        if not verify_signature(user_address, consent_signature):
            raise InvalidSignature(user_address, consent_signature)

        database.user_consents.add_consent(user_address, ip_address)
        db.session.commit()
