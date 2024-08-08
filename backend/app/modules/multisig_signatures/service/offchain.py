from typing import List, Dict

from app.context.manager import Context
from app.exceptions import InvalidMultisigSignatureRequest, InvalidMultisigAddress
from app.extensions import db
from app.infrastructure import database
from app.infrastructure.database.models import MultisigSignatures
from app.infrastructure.database.multisig_signature import SigStatus, MultisigFilters
from app.infrastructure.external_api.common import retry_request
from app.infrastructure.external_api.safe.message_details import get_message_details
from app.modules.common.allocations.deserializer import deserialize_payload
from app.modules.common.crypto.eip1271 import get_message_hash
from app.modules.common.crypto.signature import (
    EncodingStandardFor,
    hash_signable_message,
)
from app.modules.common.verifier import Verifier
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.core import (
    prepare_encoded_message,
    prepare_msg_to_save,
    approve_pending_signatures,
)
from app.modules.multisig_signatures.dto import Signature
from app.pydantic import Model


class OffchainMultisigSignatures(Model):
    is_mainnet: bool = False
    verifiers: Dict[SignatureOpType, Verifier]

    staged_signatures: List[MultisigSignatures] = []

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
            msg_hash=signature_db.msg_hash,
            safe_msg_hash=signature_db.safe_msg_hash,
            user_address=signature_db.address,
            ip_address=signature_db.user_ip,
            signature=signature_db.confirmed_signature,
        )

    def approve_pending_signatures(
        self, _: Context, op_type: SignatureOpType
    ) -> List[Signature]:
        filters = MultisigFilters(type=op_type, status=SigStatus.PENDING)
        pending_signatures = (
            database.multisig_signature.get_multisig_signatures_by_filters(filters)
        )
        new_staged_signatures, approved_signatures = approve_pending_signatures(
            self.staged_signatures, pending_signatures, self.is_mainnet
        )

        self.staged_signatures.extend(new_staged_signatures)

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
        user_ip: str,
    ):
        message = signature_data.get("message")
        encoding_standard = self._verify_signature(
            context, user_address, message, op_type
        )
        encoded_message = prepare_encoded_message(message, op_type, encoding_standard)
        safe_message_hash = hash_signable_message(encoded_message)
        message_hash = get_message_hash(user_address, safe_message_hash)
        msg_to_save = prepare_msg_to_save(message, op_type)

        self._verify_owner(user_address, message_hash)

        database.multisig_signature.save_signature(
            user_address, op_type, msg_to_save, message_hash, safe_message_hash, user_ip
        )
        db.session.commit()

    def _verify_owner(self, user_address: str, message_hash: str):
        message_details = retry_request(
            req_func=get_message_details,
            status_code=404,
            message_hash=message_hash,
            is_mainnet=self.is_mainnet,
        )

        if message_details is None or user_address != message_details["safe"]:
            raise InvalidMultisigAddress()

    def _verify_signature(
        self,
        context: Context,
        user_address: str,
        signature_msg: dict | str,
        op_type: SignatureOpType,
    ) -> EncodingStandardFor:
        verifier = self.verifiers[op_type]

        if op_type == SignatureOpType.ALLOCATION:
            if not verifier.verify_logic(
                context,
                user_address=user_address,
                payload=deserialize_payload(signature_msg),
            ):
                raise InvalidMultisigSignatureRequest()
            return EncodingStandardFor.DATA
        else:
            if not verifier.verify_logic(
                context, user_address=user_address, message=signature_msg
            ):
                raise InvalidMultisigSignatureRequest()
            return EncodingStandardFor.TEXT
