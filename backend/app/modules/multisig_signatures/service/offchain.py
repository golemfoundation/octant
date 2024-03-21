from app.context.manager import Context
from app.modules.multisig_signatures.dto import Signature, SignatureOpType
from app.pydantic import Model


class CalculatedOctantRewards(Model):
    def get_last_pending_signature(
        self, context: Context, user_address: str, op_type: SignatureOpType
    ) -> Signature:
        return Signature(message="message", hash="hash")

    def save_pending_signature(
        self,
        context: Context,
        user_address: str,
        op_type: SignatureOpType,
        signature_data: dict,
    ):
        signature = Signature.from_dict(signature_data)
        ...
