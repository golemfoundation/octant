import hashlib
from collections import namedtuple

from app.context.manager import Context
from app.exceptions import DelegationAlreadyExists, InvalidSignature
from app.modules.common.crypto.signature import (
    encode_for_signing,
    EncodingStandardFor,
    verify_signed_message,
)
from app.modules.dto import ScoreDelegationPayload

HashedAddresses = namedtuple(
    "HashedAddresses", ["primary_addr_hash", "secondary_addr_hash", "both_hash"]
)


def build_score_delegation_message(primary_addr: str, secondary_addr: str) -> str:
    return f"Delegation of UQ score from {secondary_addr} to {primary_addr}"


def get_hashed_addresses(
    context: Context, payload: ScoreDelegationPayload
) -> HashedAddresses:
    primary_addr_data = str(context.epoch_details.epoch_num) + payload.primary_addr
    secondary_addr_data = str(context.epoch_details.epoch_num) + payload.secondary_addr

    hashed_primary = hashlib.sha256(primary_addr_data.encode()).hexdigest()
    hashed_secondary = hashlib.sha256(secondary_addr_data.encode()).hexdigest()
    hashed_both = hashlib.sha256(
        (primary_addr_data + secondary_addr_data).encode()
    ).hexdigest()

    return HashedAddresses(hashed_primary, hashed_secondary, hashed_both)


def verify_score_delegation(hashed_addresses: HashedAddresses, all_hashes: set[str]):
    hashed_primary, hashed_secondary, _ = hashed_addresses
    if hashed_primary in all_hashes or hashed_secondary in all_hashes:
        raise DelegationAlreadyExists


def verify_signatures(payload: ScoreDelegationPayload):
    msg_text = build_score_delegation_message(
        payload.primary_addr, payload.secondary_addr
    )
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg_text)

    verify_primary = verify_signed_message(
        payload.primary_addr, encoded_msg, payload.primary_addr_signature
    )
    verify_secondary = verify_signed_message(
        payload.secondary_addr, encoded_msg, payload.secondary_addr_signature
    )

    if not verify_primary:
        raise InvalidSignature(payload.primary_addr, payload.primary_addr_signature)

    if not verify_secondary:
        raise InvalidSignature(payload.secondary_addr, payload.secondary_addr_signature)
