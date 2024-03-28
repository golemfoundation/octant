from app.extensions import db
from app.context.manager import Context
from app.exceptions import DuplicateConsent, InvalidSignature
from app.infrastructure import database
from app.modules.common.verifier import Verifier
from app.modules.user.tos import core
from app.pydantic import Model


class InitialUserTosVerifier(Verifier):
    def _verify_logic(self, _: Context, **kwargs):
        user_address = kwargs["user_address"]
        consent = database.user_consents.get_last_by_address(user_address)
        if consent is not None:
            raise DuplicateConsent(user_address)

    def _verify_signature(self, _: Context, **kwargs):
        user_address, signature = kwargs["user_address"], kwargs["consent_signature"]

        if not core.verify_signature(user_address, signature):
            raise InvalidSignature(user_address, signature)


class InitialUserTos(Model):
    verifier: Verifier

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
        self.verifier.verify(
            context, user_address=user_address, consent_signature=consent_signature
        )
        database.user_consents.add_consent(user_address, ip_address)
        db.session.commit()
