import json

from fastapi.testclient import TestClient
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
    fastapi_client: TestClient,
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
    res = fastapi_client.get(f"/rewards/budget/{ua_alice.address}/epoch/{STARTING_EPOCH}")
    # Parse the response text as JSON
    res_json = json.loads(res.text)
    alice_budget = int(res_json["budget"])
    assert alice_budget > 0

    res = fastapi_client.get(f"/rewards/budget/{ua_bob.address}/epoch/{STARTING_EPOCH}")
    # Parse the response text as JSON
    res_json = json.loads(res.text)
    bob_budget = int(res_json["budget"])
    assert bob_budget > 0

    # check if both users budgets are displayed in global budget endpoints
    res = fastapi_client.get(f"/rewards/budgets/epoch/{STARTING_EPOCH}")
    # Parse the response text as JSON
    res_json = json.loads(res.text)

    all_user_budgets = res_json["budgets"]
    assert any(budget["amount"] == str(alice_budget) for budget in all_user_budgets)
    assert any(budget["amount"] == str(bob_budget) for budget in all_user_budgets)

    ua_alice.allocate(1000, alice_proposals)

    # check estimated projects rewards before finalized snapshot
    res = fastapi_client.get("/rewards/projects/estimated")
    # Parse the response text as JSON
    res_json = json.loads(res.text)
    assert res_json["rewards"][0]["allocated"] == "1000"

    # TODO replace with helper to wait until end of voting
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 2)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a finalized snapshot
    res = client.finalized_snapshot()
    assert res["epoch"] == STARTING_EPOCH

    # get estimated budget by number of epochs
    res = fastapi_client.post(
        "/rewards/estimated_budget",
        json={"numberOfEpochs": 1, "glmAmount": 10000000000000000000000},
    )
    # Parse the response text as JSON
    res_json = json.loads(res.text)


    one_epoch_budget_estimation = int(res_json["budget"])
    assert one_epoch_budget_estimation > 0

    res = fastapi_client.post(
        "/rewards/estimated_budget",
        json={"numberOfEpochs": 2, "glmAmount": 10000000000000000000000},
    )
    # Parse the response text as JSON
    res_json = json.loads(res.text)

    two_epochs_budget_estimation = int(res_json["budget"])
    assert two_epochs_budget_estimation > 0
    assert two_epochs_budget_estimation > one_epoch_budget_estimation

    # write merkle root for withdrawals
    vault_core.confirm_withdrawals()

    while not vault.is_merkle_root_set(STARTING_EPOCH):
        time.sleep(1)

    # check rewards for all projects are returned in proper schema
    res = fastapi_client.get(f"/rewards/projects/epoch/{STARTING_EPOCH}")
    # Parse the response text as JSON
    res_json = json.loads(res.text)

    assert len(res_json["rewards"]) == 3
    for reward in res_json["rewards"]:
        assert "address" in reward
        assert "allocated" in reward
        assert "matched" in reward

    # check unused rewards
    res = fastapi_client.get(f"/rewards/unused/{STARTING_EPOCH}")
    # Parse the response text as JSON
    res_json = json.loads(res.text)
    assert int(res_json["value"]) == bob_budget

    # check epoch merkle root exists
    res = fastapi_client.get(f"/rewards/merkle_tree/{STARTING_EPOCH}")
    # Parse the response text as JSON
    res_json = json.loads(res.text)
    assert len(res_json["leaves"]) == 4
    assert res_json["leafEncoding"] == ["address", "uint256"]

    # check epoch leverage
    res = fastapi_client.get(f"/rewards/leverage/{STARTING_EPOCH}")
    # Parse the response text as JSON
    res_json = json.loads(res.text)
    epoch_leverage = int(res_json["leverage"])
    assert epoch_leverage > 0
