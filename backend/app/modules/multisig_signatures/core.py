import json

from eth_account.messages import SignableMessage

from app.infrastructure.database.models import MultisigSignatures
from app.infrastructure.external_api.safe.message_details import get_message_details
from app.infrastructure.external_api.safe.user_details import get_user_details
from app.modules.common.crypto.eip712 import build_allocations_eip712_data
from app.modules.common.crypto.signature import (
    EncodingStandardFor,
    encode_for_signing,
)
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.dto import Signature


def prepare_msg_to_save(message: str | dict, op_type: SignatureOpType) -> str:
    return json.dumps(message) if op_type == SignatureOpType.ALLOCATION else message


def prepare_encoded_message(
    message: str | dict,
    op_type: SignatureOpType,
    encoding_standard: EncodingStandardFor,
) -> SignableMessage:
    if op_type == SignatureOpType.ALLOCATION:
        message = build_allocations_eip712_data(message.get("payload"))

    return encode_for_signing(encoding_standard, message)


def _create_signature_object(signature: MultisigSignatures) -> Signature:
    return Signature(
        signature.id,
        signature.message,
        signature.msg_hash,
        signature.safe_msg_hash,
        signature.address,
        signature.user_ip,
        signature.confirmed_signature,
    )


def _process_staged_signatures(staged_signatures: list[MultisigSignatures]) -> dict:
    return {sig.id: sig for sig in staged_signatures}


def approve_pending_signatures(
    staged_signatures: list[MultisigSignatures],
    pending_signatures: list[MultisigSignatures],
    is_mainnet: bool,
) -> tuple[list[Signature], list[Signature]]:
    approved_signatures = []
    new_staged_signatures = []

    staged_signatures_dict = _process_staged_signatures(staged_signatures)

    for pending_signature in pending_signatures:
        staged_signature = staged_signatures_dict.get(pending_signature.id)
        if staged_signature:
            approved_signatures.append(_create_signature_object(pending_signature))
            continue

        message_details = get_message_details(
            pending_signature.msg_hash, is_mainnet=is_mainnet
        )
        confirmations = message_details["confirmations"]
        threshold = int(
            get_user_details(pending_signature.address, is_mainnet=is_mainnet)[
                "threshold"
            ]
        )

        if len(confirmations) >= threshold:
            pending_signature.confirmed_signature = message_details["preparedSignature"]
            new_staged_signatures.append(pending_signature)
            approved_signatures.append(_create_signature_object(pending_signature))

    return new_staged_signatures, approved_signatures
