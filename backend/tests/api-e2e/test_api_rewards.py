import pytest
import time

from flask import current_app as app
from app.extensions import vault
from app.legacy.core.projects import get_projects_addresses
from tests.conftest import Client, UserAccount
from tests.helpers.constants import STARTING_EPOCH
from app.legacy.core import vault as vault_core


@pytest.mark.api
def test_rewards_basic(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
    ua_bob: UserAccount,
    setup_funds,
):
    alice_proposals = get_projects_addresses(1)[:3]

    # lock GLM from two accounts
    ua_alice.lock(10000)
    ua_bob.lock(15000)

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)

    # fund the vault (amount here is arbitrary)
    vault.fund(deployer._account, 1000 * 10**18)

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # check if both users have a budget
    res = client.get_user_rewards_in_epoch(
        address=ua_alice.address, epoch=STARTING_EPOCH
    )
    alice_budget = int(res["budget"])
    assert alice_budget > 0

    res = client.get_user_rewards_in_epoch(address=ua_bob.address, epoch=STARTING_EPOCH)
    bob_budget = int(res["budget"])
    assert bob_budget > 0

    # check if both users budgets are displayed in global budget endpoints
    res = client.get_total_users_rewards_in_epoch(epoch=STARTING_EPOCH)
    all_user_budgets = res["budgets"]
    assert any(budget["amount"] == str(alice_budget) for budget in all_user_budgets)
    assert any(budget["amount"] == str(bob_budget) for budget in all_user_budgets)

    ua_alice.allocate(1000, alice_proposals)

    # check estimated projects rewards before finalized snapshot
    res = client.get_estimated_projects_rewards()
    assert res["rewards"][0]["allocated"] == "1000"

    # TODO replace with helper to wait until end of voting
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 2)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a finalized snapshot
    res = client.finalized_snapshot()
    assert res["epoch"] == STARTING_EPOCH

    # get estimated budget by number of epochs
    res = client.get_estimated_budget_by_epochs(1, 10000000000000000000000)
    one_epoch_budget_estimation = int(res["budget"])
    assert one_epoch_budget_estimation > 0

    res = client.get_estimated_budget_by_epochs(2, 10000000000000000000000)
    two_epochs_budget_estimation = int(res["budget"])
    assert two_epochs_budget_estimation > 0
    assert two_epochs_budget_estimation > one_epoch_budget_estimation

    # get estimated budget by number of days
    res = client.get_estimated_budget_by_days(200, 10000000000000000000000)
    two_hundreds_days_budget_estimation = int(res["budget"])
    assert two_hundreds_days_budget_estimation > 0

    res = client.get_estimated_budget_by_days(300, 10000000000000000000000)
    three_hundreds_days_budget_estimation = int(res["budget"])
    assert three_hundreds_days_budget_estimation > 0
    assert three_hundreds_days_budget_estimation > two_hundreds_days_budget_estimation

    # write merkle root for withdrawals
    vault_core.confirm_withdrawals()

    while not vault.is_merkle_root_set(STARTING_EPOCH):
        time.sleep(1)

    # check rewards for all projects are returned in proper schema
    res = client.get_projects_with_matched_rewards_in_epoch(epoch=STARTING_EPOCH)
    assert len(res[0]["rewards"]) == 3
    for reward in res[0]["rewards"]:
        assert "address" in reward
        assert "allocated" in reward
        assert "matched" in reward

    # check unused rewards
    res = client.get_unused_rewards(epoch=STARTING_EPOCH)
    assert int(res["value"]) == bob_budget

    # check epoch merkle root exists
    res = client.get_rewards_merkle_tree(epoch=STARTING_EPOCH)
    assert len(res["leaves"]) == 4
    assert res["leafEncoding"] == ["address", "uint256"]

    # check epoch leverage
    res = client.get_rewards_leverage(epoch=STARTING_EPOCH)
    epoch_leverage = int(res["leverage"])
    assert epoch_leverage > 0
