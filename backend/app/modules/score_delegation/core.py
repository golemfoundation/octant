import hashlib
from collections import namedtuple
from enum import Enum

from app.context.manager import Context
from app.exceptions import (
    DelegationAlreadyExists,
    InvalidSignature,
    DelegationDoesNotExist,
)
from app.modules.common.crypto.signature import (
    encode_for_signing,
    EncodingStandardFor,
    verify_signed_message,
)
from app.modules.dto import ScoreDelegationPayload

HashedAddresses = namedtuple(
    "HashedAddresses", ["primary_addr_hash", "secondary_addr_hash", "both_hash"]
)


class ActionType(Enum):
    DELEGATION = "delegation"
    RECALCULATION = "recalculation"


def build_score_delegation_message(primary_addr: str, secondary_addr: str) -> str:
    return f"Delegation of UQ score from {secondary_addr} to {primary_addr}"


def build_score_recalculation_message(primary_addr: str, secondary_addr: str) -> str:
    return f"Recalculation of UQ score from {secondary_addr} to {primary_addr}"


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


def verify_score_delegation(
    hashed_addresses: HashedAddresses, all_hashes: set[str], action: ActionType
):
    hashed_primary, hashed_secondary, hashed_both = hashed_addresses

    match action:
        case ActionType.DELEGATION:
            if hashed_primary in all_hashes or hashed_secondary in all_hashes:
                raise DelegationAlreadyExists
        case ActionType.RECALCULATION:
            if hashed_both not in all_hashes:
                raise DelegationDoesNotExist
        case _:
            raise ValueError(f"Invalid action type: {action}")


def verify_signatures(payload: ScoreDelegationPayload, action: ActionType):
    match action:
        case ActionType.DELEGATION:
            msg_text = build_score_delegation_message(
                payload.primary_addr, payload.secondary_addr
            )
        case ActionType.RECALCULATION:
            msg_text = build_score_recalculation_message(
                payload.primary_addr, payload.secondary_addr
            )
        case _:
            raise ValueError(f"Invalid action type: {action}")

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
