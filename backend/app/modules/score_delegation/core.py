from enum import Enum
from itertools import permutations
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
from app.modules.common.delegation import HashedAddresses, hash_addresses
from app.modules.dto import ScoreDelegationPayload

MIN_SCORE = 20


class ActionType(Enum):
    DELEGATION = "delegation"
    RECALCULATION = "recalculation"


def build_score_delegation_message(primary_addr: str, secondary_addr: str) -> str:
    return f"Delegation of UQ score from {secondary_addr} to {primary_addr}"


def delegation_check(
    addresses: list[str],
    all_hashes: set[str],
    salt: str,
    salt_primary: str,
    normalize=True,
) -> set[Tuple[str, str]]:
    result = []
    for secondary, primary in permutations(addresses, 2):
        _, _, both = hash_addresses(
            primary, secondary, salt, salt_primary, normalize=normalize
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
