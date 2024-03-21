from app.context.manager import Context
from app.infrastructure import database
from app.modules.multisig_signatures.dto import Signature, SignatureOpType
from app.pydantic import Model


class OffchainMultisigSignatures(Model):
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
        ...
