import pytest
from flask import current_app as app

from app.modules.dto import ScoreDelegationPayload
from app.infrastructure import database
from tests.conftest import Client
from tests.helpers.constants import STARTING_EPOCH, USER1_ADDRESS, USER2_ADDRESS


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
