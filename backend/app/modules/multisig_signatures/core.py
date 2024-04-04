import json

from eth_account.messages import SignableMessage

from app.modules.common.crypto.eip712 import build_allocations_eip712_data
from app.modules.common.crypto.signature import (
    EncodingStandardFor,
    encode_for_signing,
)
from app.modules.dto import SignatureOpType


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
