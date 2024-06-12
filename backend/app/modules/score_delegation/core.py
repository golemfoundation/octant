import hashlib
from collections import namedtuple
from enum import Enum

from app.exceptions import (
    DelegationAlreadyExists,
    InvalidSignature,
    DelegationDoesNotExist,
    AntisybilScoreTooLow,
)
from app.modules.common.crypto.signature import (
    encode_for_signing,
    EncodingStandardFor,
    verify_signed_message,
)
from app.modules.dto import ScoreDelegationPayload


MIN_SCORE = 15

HashedAddresses = namedtuple(
    "HashedAddresses", ["primary_addr_hash", "secondary_addr_hash", "both_hash"]
)


class ActionType(Enum):
    DELEGATION = "delegation"
    RECALCULATION = "recalculation"


def build_score_delegation_message(primary_addr: str, secondary_addr: str) -> str:
    return f"Delegation of UQ score from {secondary_addr} to {primary_addr}"


def get_hashed_addresses(
    payload: ScoreDelegationPayload, salt: str, salt_primary: str
) -> HashedAddresses:
    primary_addr_data = salt_primary + payload.primary_addr
    secondary_addr_data = salt + payload.secondary_addr

    hashed_primary = hashlib.sha256(primary_addr_data.encode()).hexdigest()
    hashed_secondary = hashlib.sha256(secondary_addr_data.encode()).hexdigest()
    hashed_both = hashlib.sha256(
        (primary_addr_data + secondary_addr_data).encode()
    ).hexdigest()

    return HashedAddresses(hashed_primary, hashed_secondary, hashed_both)


def verify_score_delegation(
    hashed_addresses: HashedAddresses,
    all_hashes: set[str],
    score: float,
    action: ActionType,
):
    _verify_hashed_addresses(action, hashed_addresses, all_hashes)
    _verify_score(score)


def verify_signatures(payload: ScoreDelegationPayload, action: ActionType):
    match action:
        case ActionType.DELEGATION:
            msg_text = build_score_delegation_message(
                payload.primary_addr, payload.secondary_addr
            )
        case ActionType.RECALCULATION:
            # There is no need to verify recalculation, anyone knowing addresses can trigger it
            return True
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


def _verify_hashed_addresses(
    action: ActionType, hashed_addresses: HashedAddresses, all_hashes: set[str]
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


def _verify_score(score: float):
    if score < MIN_SCORE:
        raise AntisybilScoreTooLow(score, MIN_SCORE)
