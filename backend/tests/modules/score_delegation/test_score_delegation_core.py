import hashlib

import pytest

from app import exceptions
from app.modules.dto import (
    ScoreDelegationPayload,
)
from app.modules.score_delegation import core
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS, USER3_ADDRESS
from tests.helpers.context import get_context


def test_score_delegation_passes():
    context = get_context()
    carol_data = str(context.epoch_details.epoch_num) + USER3_ADDRESS
    hashed_carol = hashlib.sha256(carol_data.encode()).hexdigest()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(context, payload)
    core.verify_score_delegation(
        hashed_addresses, {hashed_carol}, 15, core.ActionType.DELEGATION
    )


def test_score_delegation_passes_when_there_are_no_other_delegations():
    context = get_context()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(context, payload)
    core.verify_score_delegation(hashed_addresses, set(), 15, core.ActionType.DELEGATION)


def test_score_delegation_fails():
    context = get_context()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(context, payload)

    with pytest.raises(exceptions.DelegationAlreadyExists):
        core.verify_score_delegation(
            hashed_addresses,
            {hashed_addresses.primary_addr_hash},
            15,
            core.ActionType.DELEGATION,
        )

    with pytest.raises(exceptions.DelegationAlreadyExists):
        core.verify_score_delegation(
            hashed_addresses,
            {hashed_addresses.secondary_addr_hash},
            15,
            core.ActionType.DELEGATION,
        )


def test_score_recalculation_passes():
    context = get_context()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(context, payload)
    core.verify_score_delegation(
        hashed_addresses, {hashed_addresses.both_hash}, 15, core.ActionType.RECALCULATION
    )


def test_score_recalculation_fails_when_there_are_no_other_delegations():
    context = get_context()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(context, payload)
    with pytest.raises(exceptions.DelegationDoesNotExist):
        core.verify_score_delegation(
            hashed_addresses, set(), 15, core.ActionType.RECALCULATION
        )


def test_score_recalculation_fails():
    context = get_context()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(context, payload)
    alice_data = str(context.epoch_details.epoch_num) + USER1_ADDRESS
    carol_data = str(context.epoch_details.epoch_num) + USER3_ADDRESS
    hashed_alice_and_carol = hashlib.sha256(
        (alice_data + carol_data).encode()
    ).hexdigest()

    with pytest.raises(exceptions.DelegationDoesNotExist):
        core.verify_score_delegation(
            hashed_addresses, {hashed_alice_and_carol}, 15, core.ActionType.RECALCULATION
        )


def test_score_is_too_low():
    context = get_context()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(context, payload)

    with pytest.raises(exceptions.AntisybilScoreTooLow):
        core.verify_score_delegation(
            hashed_addresses, set(), 14.9, core.ActionType.DELEGATION
        )


def test_score_is_sufficient():
    context = get_context()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(context, payload)
    core.verify_score_delegation(
        hashed_addresses, set(), 15.0, core.ActionType.DELEGATION
    )
