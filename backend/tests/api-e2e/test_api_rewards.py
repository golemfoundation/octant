import pytest
import time

from flask import current_app as app
from tests.conftest import Client, UserAccount
from tests.helpers.constants import STARTING_EPOCH


@pytest.mark.api
def test_rewards_basic(
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
    res = client.get_user_rewards_in_epoch(address=ua_alice.address, epoch=STARTING_EPOCH)
    alice_budget = int(res["budget"])
    assert alice_budget > 0

    res = client.get_user_rewards_in_epoch(address=ua_bob.address, epoch=STARTING_EPOCH)
    bob_budget = int(res["budget"])
    assert bob_budget > 0

    # forward time to the beginning of the epoch 3
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 2)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a pending snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 1
    ua_alice.lock(10000)
    time.sleep(120)

    # make a finalized snapshot
    res = client.finalized_snapshot()
    assert res["epoch"] == STARTING_EPOCH
    ua_alice.lock(10000)
    time.sleep(120)

    # check if both users will have budget in next epoch
    res = client.get_user_rewards_in_upcoming_epoch(address=ua_alice.address)
    alice_upcoming_budget = int(res["upcomingBudget"])
    assert alice_upcoming_budget > 0

    res = client.get_user_rewards_in_upcoming_epoch(address=ua_bob.address)
    bob_upcoming_budget = int(res["upcomingBudget"])
    assert bob_upcoming_budget > 0
    assert bob_upcoming_budget > alice_upcoming_budget

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 2)

    # check epoch budgets contain previously upcoming budgets values
    res = client.get_total_users_rewards_in_epoch(epoch=STARTING_EPOCH)
    assert res.__contains__(str(alice_upcoming_budget))
    assert res.__contains__(str(bob_upcoming_budget))
