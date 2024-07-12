from unittest.mock import Mock

import pytest

from app.exceptions import (
    InvalidRecalculationRequest,
    DelegationDoesNotExist,
    InvalidDelegationForLockingAddress,
)
from app.infrastructure import database
from app.modules.dto import ScoreDelegationPayload
from app.modules.score_delegation.service.simple_obfuscation import (
    SimpleObfuscationDelegation,
    SimpleObfuscationDelegationVerifier,
)
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS, USER3_ADDRESS


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.fixture()
def payload():
    return ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature="0x4c7f3b8d06ef3abbe6f5c0762fda01517c62709a3e0bde7ae19a945d3359b0673197db2dabeb20babb9b71c2cbb7e83cfa4cb3078c9bcdc284dcd605ebe89ddc1b",
        secondary_addr_signature="0x5e7e86d5acea5cc431b8d148842e21584a7afe16b7de3b5586d20f5de97179f549726baa021dcaf6220ee5116c579df9d40375fa58d3480390289df6a088b9ec1b",
    )


def test_delegation(
    context, mock_empty_events_generator, payload, tos_users, patch_is_contract
):
    verifier = SimpleObfuscationDelegationVerifier()
    user_deposits = CalculatedUserDeposits(events_generator=mock_empty_events_generator)
    antisybil = Mock()
    antisybil.fetch_antisybil_status.return_value = (
        20,
        "4024-05-22T14:46:46.810800+00:00",
        ["stamp"],
    )
    service = SimpleObfuscationDelegation(
        verifier=verifier, antisybil=antisybil, user_deposits_service=user_deposits
    )
    service.delegate(context, payload)

    delegations = database.score_delegation.get_all_delegations()
    assert len(delegations) == 3


def test_delegation_disabled_when_secondary_is_locking(
    context, mock_events_generator, tos_users, patch_is_contract
):
    verifier = SimpleObfuscationDelegationVerifier()
    user_deposits = CalculatedUserDeposits(events_generator=mock_events_generator)
    antisybil = Mock()
    antisybil.fetch_antisybil_status.return_value = (
        20,
        "4024-05-22T14:46:46.810800+00:00",
        ["stamp"],
    )
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature="0x4c7f3b8d06ef3abbe6f5c0762fda01517c62709a3e0bde7ae19a945d3359b0673197db2dabeb20babb9b71c2cbb7e83cfa4cb3078c9bcdc284dcd605ebe89ddc1b",
        secondary_addr_signature="0x5e7e86d5acea5cc431b8d148842e21584a7afe16b7de3b5586d20f5de97179f549726baa021dcaf6220ee5116c579df9d40375fa58d3480390289df6a088b9ec1b",
    )
    service = SimpleObfuscationDelegation(
        verifier=verifier, antisybil=antisybil, user_deposits_service=user_deposits
    )
    with pytest.raises(InvalidDelegationForLockingAddress):
        service.delegate(context, payload)


def test_disable_recalculation_when_secondary_address_is_used(
    context, mock_empty_events_generator, payload, patch_is_contract
):
    verifier = SimpleObfuscationDelegationVerifier()
    user_deposits = CalculatedUserDeposits(events_generator=mock_empty_events_generator)
    antisybil = Mock()
    antisybil.fetch_antisybil_status.return_value = (
        20,
        "4024-05-22T14:46:46.810800+00:00",
        ["stamp"],
    )
    service = SimpleObfuscationDelegation(
        verifier=verifier, antisybil=antisybil, user_deposits_service=user_deposits
    )
    service.delegate(context, payload)

    antisybil.fetch_antisybil_status.return_value = (
        25,
        "4024-05-22T14:46:46.810800+00:00",
        ["stamp"],
    )
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS, secondary_addr=USER2_ADDRESS
    )

    with pytest.raises(InvalidRecalculationRequest):
        service.recalculate(context, payload)

    delegations = database.score_delegation.get_all_delegations()
    assert len(delegations) == 3


def test_recalculation_when_delegation_is_not_done(
    context, mock_empty_events_generator, payload, patch_is_contract
):
    verifier = SimpleObfuscationDelegationVerifier()
    user_deposits = CalculatedUserDeposits(events_generator=mock_empty_events_generator)
    antisybil = Mock()
    antisybil.fetch_antisybil_status.return_value = (
        20,
        "4024-05-22T14:46:46.810800+00:00",
        ["stamp"],
    )
    service = SimpleObfuscationDelegation(
        verifier=verifier, antisybil=antisybil, user_deposits_service=user_deposits
    )
    service.delegate(context, payload)

    antisybil.fetch_antisybil_status.return_value = (
        25,
        "4024-05-22T14:46:46.810800+00:00",
        ["stamp"],
    )
    payload = ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS, secondary_addr=USER3_ADDRESS
    )

    with pytest.raises(DelegationDoesNotExist):
        service.recalculate(context, payload)

    delegations = database.score_delegation.get_all_delegations()
    assert len(delegations) == 3
