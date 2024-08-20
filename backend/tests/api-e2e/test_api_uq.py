import pytest
from flask import current_app as app

from app.infrastructure import database
from app.legacy.core.projects import get_projects_addresses
from tests.conftest import UserAccount, Client
from tests.helpers.constants import STARTING_EPOCH


@pytest.mark.api
def test_uq_for_user(client: Client, ua_alice: UserAccount):
    client.move_to_next_epoch(STARTING_EPOCH + 1)
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    client.move_to_next_epoch(STARTING_EPOCH + 3)

    epoch_no = client.wait_for_sync(STARTING_EPOCH + 3)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    USER_NOT_FOUND = 404
    _, code = client.get_user_uq(ua_alice.address, 4)
    assert code == USER_NOT_FOUND

    database.user.add_user(ua_alice.address)

    res, code = client.get_user_uq(ua_alice.address, 4)
    assert code == 200
    assert res["uniquenessQuotient"] == "1.0" or res["uniquenessQuotient"] == "0.2"


@pytest.mark.api
def test_uq_for_all_users(client: Client, ua_alice: UserAccount, ua_bob, setup_funds):
    client.move_to_next_epoch(STARTING_EPOCH + 1)
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    client.move_to_next_epoch(STARTING_EPOCH + 3)
    ua_alice.lock(10000)
    ua_bob.lock(10000)
    client.move_to_next_epoch(STARTING_EPOCH + 4)

    epoch_no = client.wait_for_sync(STARTING_EPOCH + 4)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # make an allocation during AW since it saves the uq to the database
    alice_bob_proposals = get_projects_addresses(4)[:3]

    ua_alice.allocate(1000, alice_bob_proposals)
    ua_bob.allocate(1000, alice_bob_proposals)

    res, code = client.get_all_uqs(4)
    assert code == 200
    assert type(res["uqsInfo"]) is list
    assert len(res["uqsInfo"]) == 2

    assert res["uqsInfo"][0]["userAddress"] == ua_alice.address
    assert res["uqsInfo"][1]["userAddress"] == ua_bob.address
