import pytest

from flask import current_app as app
from tests.helpers.constants import STARTING_EPOCH
from tests.conftest import Client, UserAccount


@pytest.mark.api
def test_pending_snapshot(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
    ua_bob: UserAccount,
    setup_funds,
):
    # lock GLM from two accounts
    ua_alice.lock(10000)
    ua_bob.lock(15000)

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # check if both users have a budget
    res = client.get_rewards_budget(address=ua_alice.address, epoch=STARTING_EPOCH)
    alice_budget = int(res["budget"])
    assert alice_budget > 0

    res = client.get_rewards_budget(address=ua_bob.address, epoch=STARTING_EPOCH)
    bob_budget = int(res["budget"])
    assert bob_budget > 0

    # check that user with bigger lock has bigger budget
    assert bob_budget > alice_budget
    app.logger.debug(f"bob_budget: {bob_budget} while alice_budget: {alice_budget}")
