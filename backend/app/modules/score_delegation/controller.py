from typing import Tuple

from eth_utils.address import to_checksum_address

from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.exceptions import DelegationCheckWrongParams, DelegationDoesNotExist
from app.modules.dto import ScoreDelegationPayload
from app.modules.modules_factory.current import CurrentServices
from app.modules.registry import get_services


def delegate_uq_score(payload: dict):
    context = state_context(EpochState.CURRENT)
    services: CurrentServices = get_services(EpochState.CURRENT)
    score_delegation_payload = _deserialize_payload(payload)
    services.score_delegation_service.delegate(context, score_delegation_payload)


def recalculate_uq_score(payload: dict):
    context = state_context(EpochState.CURRENT)
    services: CurrentServices = get_services(EpochState.CURRENT)
    score_delegation_payload = _deserialize_payload(payload)
    services.score_delegation_service.recalculate(context, score_delegation_payload)


def delegation_check(addresses: str) -> Tuple[str, str]:
    tokens = addresses.split(",")
    if len(tokens) < 2:
        raise DelegationCheckWrongParams()
    if len(tokens) > 10:
        raise DelegationCheckWrongParams()
    context = state_context(EpochState.CURRENT)
    services: CurrentServices = get_services(EpochState.CURRENT)
    pairs = list(services.score_delegation_service.check(context, tokens))
    if not pairs:
        raise DelegationDoesNotExist()
    if len(pairs) > 1:
        raise DelegationDoesNotExist()
    return pairs[0]


def _deserialize_payload(payload: dict) -> ScoreDelegationPayload:
    return ScoreDelegationPayload(
        primary_addr=to_checksum_address(payload["primaryAddr"]),
        secondary_addr=to_checksum_address(payload["secondaryAddr"]),
        primary_addr_signature=payload["primaryAddrSignature"],
        secondary_addr_signature=payload["secondaryAddrSignature"],
    )
