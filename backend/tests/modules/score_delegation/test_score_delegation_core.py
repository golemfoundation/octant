import hashlib
from datetime import datetime, timedelta
from typing import Tuple

import pytest

from app import exceptions
from app.modules.dto import ScoreDelegationPayload
from app.modules.score_delegation import core
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS, USER3_ADDRESS


def test_score_delegation_passes():
    carol_data = "salt" + USER3_ADDRESS
    hashed_carol = hashlib.sha256(carol_data.encode()).hexdigest()
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(payload, "salt", "salt_primary")
    core.verify_score_delegation(
        hashed_addresses, {hashed_carol}, 20, core.ActionType.DELEGATION
    )


def test_score_delegation_passes_when_there_are_no_other_delegations():
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(payload, "salt", "salt_primary")
    core.verify_score_delegation(
        hashed_addresses, set(), 20, core.ActionType.DELEGATION
    )


def test_score_delegation_fails():
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(payload, "salt", "salt_primary")

    with pytest.raises(exceptions.DelegationAlreadyExists):
        core.verify_score_delegation(
            hashed_addresses,
            {hashed_addresses.primary_addr_hash},
            20,
            core.ActionType.DELEGATION,
        )

    with pytest.raises(exceptions.DelegationAlreadyExists):
        core.verify_score_delegation(
            hashed_addresses,
            {hashed_addresses.secondary_addr_hash},
            20,
            core.ActionType.DELEGATION,
        )


def test_score_recalculation_passes():
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(payload, "salt", "salt_primary")
    core.verify_score_delegation(
        hashed_addresses,
        {hashed_addresses.both_hash},
        20,
        core.ActionType.RECALCULATION,
    )


def test_score_recalculation_fails_when_there_are_no_other_delegations():
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(payload, "salt", "salt_primary")
    with pytest.raises(exceptions.DelegationDoesNotExist):
        core.verify_score_delegation(
            hashed_addresses, set(), 20, core.ActionType.RECALCULATION
        )


def test_score_recalculation_fails():
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(payload, "salt", "salt_primary")
    alice_data = "salt_primary" + USER1_ADDRESS
    carol_data = "salt" + USER3_ADDRESS
    hashed_alice_and_carol = hashlib.sha256(
        (alice_data + carol_data).encode()
    ).hexdigest()

    with pytest.raises(exceptions.DelegationDoesNotExist):
        core.verify_score_delegation(
            hashed_addresses,
            {hashed_alice_and_carol},
            20,
            core.ActionType.RECALCULATION,
        )


def test_score_is_too_low():
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(payload, "salt", "salt_primary")

    with pytest.raises(exceptions.AntisybilScoreTooLow):
        core.verify_score_delegation(
            hashed_addresses, set(), 19.9, core.ActionType.DELEGATION
        )


def test_score_is_sufficient():
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature=None,
        secondary_addr_signature=None,
    )
    hashed_addresses = core.get_hashed_addresses(payload, "salt", "salt_primary")
    core.verify_score_delegation(
        hashed_addresses, set(), 20, core.ActionType.DELEGATION
    )


def _mk_db(delegations: list[Tuple[str, str]]) -> set[str]:
    results = []
    for secondary, primary in delegations:
        payload = ScoreDelegationPayload(
            primary_addr=primary,
            secondary_addr=secondary,
            primary_addr_signature=None,
            secondary_addr_signature=None,
        )
        _, _, both = core.get_hashed_addresses(payload, "salt", "salt_primary")
        results = results + [both]
    return set(results)


def test_delegation_check():
    ALICE = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    BOB = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    CAROL = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    EVE = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    FRANK = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
    HEIDI = "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
    IVAN = "0x976EA74026E726554dB657fA54763abd0C3a0aa9"
    JUDY = "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"
    MALLORY = "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"
    NICK = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"

    # no validity check of delegation is performed here
    db_hashes = _mk_db([(BOB, ALICE), (EVE, CAROL), (ALICE, FRANK)])

    def check(addresses):
        return core.delegation_check(addresses, db_hashes, "salt", "salt_primary")

    assert set() == check([ALICE, EVE])
    assert set() == check([ALICE, ALICE])
    assert set() == check([CAROL, BOB])
    assert set() == check([CAROL, ALICE])
    assert set([(BOB, ALICE)]) == check([ALICE, BOB])
    assert set([(BOB, ALICE)]) == check([BOB, ALICE])
    assert set([(BOB, ALICE)]) == check([BOB, ALICE, EVE])
    assert set([(BOB, ALICE), (EVE, CAROL)]) == check([BOB, EVE, ALICE, CAROL])
    start = datetime.now()
    assert set([(BOB, ALICE), (EVE, CAROL), (ALICE, FRANK)]) == check(
        [ALICE, BOB, CAROL, EVE, FRANK, HEIDI, IVAN, JUDY, MALLORY, NICK]
    )
    finish = datetime.now()
    assert finish - start < timedelta(seconds=2)

    # check if address checksumming works as expected
    assert set([(BOB, ALICE.lower())]) == check([ALICE.lower(), BOB])
