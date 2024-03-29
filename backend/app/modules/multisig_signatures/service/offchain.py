import json

from app.context.manager import Context
from app.exceptions import InvalidMultisigSignatureRequest
from app.extensions import db
from app.infrastructure import database
from app.infrastructure.database.models import MultisigSignatures
from app.infrastructure.database.multisig_signature import SigStatus
from app.infrastructure.external_api.safe.message_details import get_message_details
from app.infrastructure.external_api.safe.user_details import get_user_details
from app.modules.common.signature import (
    encode_for_signing,
    EncodingStandardFor,
    hash_signable_message,
)
from app.modules.common.verifier import Verifier
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.dto import Signature
from app.pydantic import Model


class OffchainMultisigSignatures(Model):
    is_mainnet: bool = False
    verifiers: dict[SignatureOpType, Verifier]

    staged_signatures: list[MultisigSignatures] = []

    def get_last_pending_signature(
        self, _: Context, user_address: str, op_type: SignatureOpType
    ) -> Signature | None:
        signature_db = database.multisig_signature.get_last_pending_signature(
            user_address, op_type
        )

        if signature_db is None:
            return None

        return Signature(
            id=signature_db.id,
            message=signature_db.message,
            hash=signature_db.hash,
        )

    def approve_pending_signatures(self, _: Context) -> list[Signature]:
        pending_signatures = database.multisig_signature.get_all_pending_signatures()
        approved_signatures = []

        staged_signatures_ids = tuple(map(lambda x: x.id, self.staged_signatures))
        for pending_signature in pending_signatures:
            if pending_signature.id in staged_signatures_ids:
                approved_signatures.append(
                    Signature(
                        pending_signature.id,
                        pending_signature.message,
                        pending_signature.hash,
                    )
                )
                continue

            confirmations = get_message_details(
                pending_signature.hash, is_mainnet=self.is_mainnet
            )["confirmations"]
            threshold = int(
                get_user_details(pending_signature.address, is_mainnet=self.is_mainnet)[
                    "threshold"
                ]
            )

            if len(confirmations) >= threshold:
                self.staged_signatures.append(pending_signature)
                approved_signatures.append(
                    Signature(
                        pending_signature.id,
                        pending_signature.message,
                        pending_signature.hash,
                    )
                )

        return approved_signatures

    def apply_staged_signatures(self, _: Context, signature_id: int):
        for idx, pending_signature in enumerate(self.staged_signatures):
            if pending_signature.id == signature_id:
                pending_signature.status = SigStatus.APPROVED
                db.session.commit()
                self.staged_signatures.pop(idx)
                return

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

        msg = json.dumps(signature_data)
        msg_hash = hash_signable_message(
            encode_for_signing(EncodingStandardFor.TEXT, msg)
        )
        database.multisig_signature.save_signature(user_address, op_type, msg, msg_hash)
        db.session.commit()
