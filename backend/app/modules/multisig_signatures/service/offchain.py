import json

from app.context.manager import Context
from app.exceptions import InvalidMultisigSignatureRequest
from app.extensions import db
from app.infrastructure import database
from app.modules.common.verifier import Verifier
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.dto import Signature
from app.pydantic import Model


class OffchainMultisigSignatures(Model):
    verifiers: dict[SignatureOpType, Verifier]

    def get_last_pending_signature(
        self, _: Context, user_address: str, op_type: SignatureOpType
    ) -> Signature | None:
        signature_db = database.multisig_signature.get_last_pending_signature(
            user_address, op_type
        )

        if signature_db is None:
            return None

        return Signature(
            message=signature_db.message,
            hash=signature_db.hash,
        )

    def save_pending_signature(
        self,
        context: Context,
        user_address: str,
        op_type: SignatureOpType,
        signature_data: dict,
    ):
        verifier = self.verifiers[op_type]
        if not verifier.verify_logic(
            context, user_address=user_address, **signature_data
        ):
            raise InvalidMultisigSignatureRequest()

        database.multisig_signature.save_signature(
            user_address, op_type, json.dumps(signature_data), ""
        )
        db.session.commit()
