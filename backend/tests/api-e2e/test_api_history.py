import pytest

from tests.conftest import Client, UserAccount
from app.legacy.core.projects import get_projects_addresses
from tests.helpers.constants import STARTING_EPOCH
from flask import current_app as app


@pytest.mark.api
def test_history_basics(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
):
    # Check user history before allocation
    user_history, status_code = client.get_user_history(ua_alice.address)
    assert len(user_history["history"]) == 0, "User history should be empty"
    assert status_code == 200

    # Get alice proposals
    alice_proposals = get_projects_addresses(1)[:3]

    # lock GLM for one account
    ua_alice.lock(10000)

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > STARTING_EPOCH - 1

    allocation_response_code = ua_alice.allocate(1000, alice_proposals)
    assert (
        allocation_response_code == 201
    ), "Allocation status code is different than 201"

    # Check user history after allocation
    user_history, status_code = client.get_user_history(ua_alice.address)
    assert (
        user_history["history"][0]["type"] == "allocation"
    ), "Type of history record should be 'allocation'"
    assert (
        len(user_history["history"][0]["eventData"]["allocations"]) == 3
    ), "Number of allocations should be 3"
    assert status_code == 200
