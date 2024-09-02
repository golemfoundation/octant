import pytest
from flask import current_app as app

from app.modules.dto import ScoreDelegationPayload
from app.infrastructure import database
from tests.conftest import Client
from tests.helpers.constants import STARTING_EPOCH, USER1_ADDRESS, USER2_ADDRESS


@pytest.mark.api
def test_delegation(client: Client, payload: ScoreDelegationPayload):
    client.move_to_next_epoch(STARTING_EPOCH + 1)
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    client.move_to_next_epoch(STARTING_EPOCH + 3)

    epoch_no = client.wait_for_sync(STARTING_EPOCH + 3)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    database.user.add_user(USER1_ADDRESS)
    database.user.add_user(USER2_ADDRESS)

    # refresh scores for users
    _, code = client.refresh_antisybil_score(USER1_ADDRESS)
    assert code == 204

    _, code = client.refresh_antisybil_score(USER2_ADDRESS)
    assert code == 204

    # retrieve a delegator's score
    delegator_score, code = client.get_antisybil_score(USER2_ADDRESS)
    assert code == 200
    assert delegator_score["status"] == "Known"
    assert float(delegator_score["score"]) > 0
    assert int(delegator_score["expires_at"]) > 0

    # retrieve a delegatee's score
    delegatee_score, code = client.get_antisybil_score(USER1_ADDRESS)
    assert code == 200
    assert delegator_score["status"] == "Known"
    assert float(delegator_score["score"]) > 0
    assert int(delegator_score["expires_at"]) > 0

    # check that scores are different before delegation
    assert float(delegator_score["score"]) != float(delegatee_score["score"])

    _, status = client.delegate(
        primary_address=payload.primary_addr,
        secondary_address=payload.secondary_addr,
        primary_address_signature=payload.primary_addr_signature,
        secondary_address_signature=payload.secondary_addr_signature,
    )
    assert status == 201

    # check that scores are the same after delegation
    delegatee_score, code = client.get_antisybil_score(payload.secondary_addr)
    assert code == 200
    assert delegatee_score["status"] == "Known"
    assert float(delegatee_score["score"]) == float(delegator_score["score"])

    # check if the secondary address is actually used off
    resp, code = client.delegate(
        primary_address=payload.primary_addr,
        secondary_address=payload.secondary_addr,
        primary_address_signature=payload.primary_addr_signature,
        secondary_address_signature=payload.secondary_addr_signature,
    )

    assert code == 400
    assert resp["message"] == "Delegation already exists"


@pytest.mark.api
def test_recalculate_in_delegation(client: Client, payload: ScoreDelegationPayload):
    """
    Recalculation can actually return two different results:
    - if the delegation does not exist, it will return 400
    - if the delegation exists, i.e. secondary address exists in the database, it will return 400
    it's due to the fact that the recalculation is already stoned for a secondary address in our implementation
    """
    client.move_to_next_epoch(STARTING_EPOCH + 1)
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    client.move_to_next_epoch(STARTING_EPOCH + 3)

    epoch_no = client.wait_for_sync(STARTING_EPOCH + 3)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    database.user.add_user(USER1_ADDRESS)
    database.user.add_user(USER2_ADDRESS)

    # try to recalculate before delegation
    data, status = client.delegation_recalculate(
        primary_address=payload.primary_addr,
        secondary_address=payload.secondary_addr,
        primary_address_signature=payload.primary_addr_signature,
        secondary_address_signature=payload.secondary_addr_signature,
    )
    assert data["message"] == "Delegation does not exists"
    assert status == 400

    # make a delegation
    _, status = client.delegate(
        primary_address=payload.primary_addr,
        secondary_address=payload.secondary_addr,
        primary_address_signature=payload.primary_addr_signature,
        secondary_address_signature=payload.secondary_addr_signature,
    )
    assert status == 201

    # recalculate after delegation
    data, status = client.delegation_recalculate(
        primary_address=payload.primary_addr,
        secondary_address=payload.secondary_addr,
        primary_address_signature=payload.primary_addr_signature,
        secondary_address_signature=payload.secondary_addr_signature,
    )

    assert data["message"] == "Invalid recalculation request"
    assert status == 400


@pytest.mark.api
def test_check_delegation(client: Client, payload: ScoreDelegationPayload):
    client.move_to_next_epoch(STARTING_EPOCH + 1)
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    client.move_to_next_epoch(STARTING_EPOCH + 3)

    epoch_no = client.wait_for_sync(STARTING_EPOCH + 3)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    database.user.add_user(USER1_ADDRESS)
    database.user.add_user(USER2_ADDRESS)

    # check if invalid request is handled correctly
    addresses = [payload.primary_addr] * 12
    _, status = client.check_delegation(*addresses)
    assert status == 400

    # check that obfuscated delegation does not exist
    _, status = client.check_delegation(payload.primary_addr, payload.secondary_addr)
    assert status == 400

    # conduct a delegation
    _, status = client.delegate(
        primary_address=payload.primary_addr,
        secondary_address=payload.secondary_addr,
        primary_address_signature=payload.primary_addr_signature,
        secondary_address_signature=payload.secondary_addr_signature,
    )
    assert status == 201

    # check if given addresses are used for delegation
    resp, status = client.check_delegation(payload.primary_addr, payload.secondary_addr)
    assert status == 200
    assert resp["primary"] == payload.primary_addr
    assert resp["secondary"] == payload.secondary_addr
