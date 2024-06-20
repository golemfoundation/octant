from itertools import permutations
from typing import NamedTuple
from enum import Enum
from eth_utils.address import to_checksum_address
import hashlib
from typing import Tuple

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


class HashedAddresses(NamedTuple):
    primary_addr_hash: str
    secondary_addr_hash: str
    both_hash: str


class ActionType(Enum):
    DELEGATION = "delegation"
    RECALCULATION = "recalculation"


def build_score_delegation_message(primary_addr: str, secondary_addr: str) -> str:
    return f"Delegation of UQ score from {secondary_addr} to {primary_addr}"


def get_hashed_addresses(
    payload: ScoreDelegationPayload,
    salt: str,
    salt_primary: str,
    normalize: bool = True,
) -> HashedAddresses:
    primary = payload.primary_addr
    secondary = payload.secondary_addr
    if normalize:
        primary = to_checksum_address(primary)
        secondary = to_checksum_address(secondary)
    primary_addr_data = salt_primary + primary
    secondary_addr_data = salt + secondary

    hashed_primary = hashlib.sha256(primary_addr_data.encode()).hexdigest()
    hashed_secondary = hashlib.sha256(secondary_addr_data.encode()).hexdigest()
    hashed_both = hashlib.sha256(
        (primary_addr_data + secondary_addr_data).encode()
    ).hexdigest()

    return HashedAddresses(hashed_primary, hashed_secondary, hashed_both)


def delegation_check(
    addresses: list[str],
    all_hashes: set[str],
    salt: str,
    salt_primary: str,
    normalize=True,
) -> set[Tuple[str, str]]:
    result = []
    for secondary, primary in permutations(addresses, 2):
        payload = ScoreDelegationPayload(
            primary_addr=primary,
            secondary_addr=secondary,
            primary_addr_signature=None,
            secondary_addr_signature=None,
        )
        _, _, both = get_hashed_addresses(
            payload, salt, salt_primary, normalize=normalize
        )
        if both in all_hashes:
            result.append((secondary, primary))
    return set(result)


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
