import pytest
import time


from app.extensions import w3, epochs
from app.legacy.core.proposals import get_proposals_addresses
from tests.conftest import Client, UserAccount

# Please note that tests here assume that they talk to blockchain and indexer
# whose state is not reset between tests.


def wait_for_sync(client: Client, target):
    while True:
        res = client.sync_status()
        print(
            f'waiting for {target}, chain perceived by indexer: {res["blockchainEpoch"]}, indexing state: {res["indexedEpoch"]}'
        )
        if res["indexedEpoch"] == target:
            return res["indexedEpoch"]


def move_to_next_epoch(target) -> bool:
    assert epochs.get_current_epoch() == target - 1
    now = w3.eth.get_block("latest").timestamp
    nextEpochAt = epochs.get_current_epoch_end()
    forward = nextEpochAt - now + 10
    w3.provider.make_request("evm_increaseTime", [forward])
    w3.provider.make_request("evm_mine", [])
    assert epochs.get_current_epoch() == target


@pytest.mark.api
def test_pending_snapshot(
    client: Client, deployer: UserAccount, ua_alice: UserAccount, ua_bob: UserAccount
):
    res = client.sync_status()
    assert res["indexedEpoch"] == res["blockchainEpoch"]
    assert res["indexedEpoch"] > 0

    # fund Octant
    deployer.fund_octant(
        address=client.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"], value=400
    )

    # lock GLM from two accounts
    deployer.transfer(ua_alice, 10000)
    ua_alice.lock(10000)
    deployer.transfer(ua_bob, 15000)
    ua_bob.lock(15000)
    #ua_bob.unlock(5000)

    # forward time to the beginning of the epoch 2
    move_to_next_epoch(2)

    # wait for indexer to catch up
    epoch_no = wait_for_sync(client, 2)
    print(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0
    print("%%%%%%%TIME STOP1%%%%%%")
    # check if both users have a budget
    res = client.get_rewards_budget(address=ua_alice.address, epoch=1)
    alice_budget = int(res["budget"])
    assert alice_budget > 0

    res = client.get_rewards_budget(address=ua_bob.address, epoch=1)
    bob_budget = int(res["budget"])
    assert bob_budget > 0
    print("%%%%%%%TIME STOP2%%%%%%")
    time.sleep(600)
    # check that user with bigger lock has bigger budget
    assert bob_budget > alice_budget
    print(f"bob_budget: {bob_budget} while alice_budget: {alice_budget} ")

@pytest.mark.api
def test_allocations(
    client: Client, deployer: UserAccount, ua_alice: UserAccount, ua_bob: UserAccount
):
    res = client.sync_status()
    assert res["indexedEpoch"] == res["blockchainEpoch"]
    assert res["indexedEpoch"] > 0

    alice_proposals = get_proposals_addresses(1)[:3]

    # fund Octant
    deployer.fund_octant(
        address=client.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"], value=400
    )

    # lock GLM from two accounts
    deployer.transfer(ua_alice, 10000)
    ua_alice.lock(10000)
    deployer.transfer(ua_bob, 15000)
    ua_bob.lock(15000)

    # forward time to the beginning of the epoch 2
    move_to_next_epoch(2)

    # wait for indexer to catch up
    epoch_no = wait_for_sync(client, 2)
    print(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    ua_alice.allocate(1000, alice_proposals)
    ua_bob.allocate(1000, alice_proposals[:1])

    allocations = client.get_epoch_allocations(1)

    assert len(allocations) == 2
    for allocation in allocations:
        for key, val in allocation.items():
            if key == "donor":
                continue
            assert int(val) > 0

@pytest.mark.api
def test_withdrawals(
    client: Client, deployer: UserAccount, ua_alice: UserAccount, ua_bob: UserAccount
):
    res = client.sync_status()
    assert res["indexedEpoch"] == res["blockchainEpoch"]
    assert res["indexedEpoch"] > 0

    alice_proposals = get_proposals_addresses(1)[:3]

    # fund Octant
    deployer.fund_octant(
        address=client.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"], value=400
    )

    # lock GLM for one account
    deployer.transfer(ua_alice, 10000)
    ua_alice.lock(10000)

    # forward time to the beginning of the epoch 2
    move_to_next_epoch(2)

    # wait for indexer to catch up
    epoch_no = wait_for_sync(client, 2)
    print(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # save account budget for assertion
    res = client.get_rewards_budget(address=ua_alice.address, epoch=1)
    alice_budget = int(res["budget"])

    # make empty vote to get personal rewards
    ua_alice.allocate(0, alice_proposals)

    # TODO replace with helper to wait until end of voting
    move_to_next_epoch(3)
    epoch_no = wait_for_sync(client, 3)
    print(f"indexed epoch: {epoch_no}")

    # make a finalized snapshot
    res = client.finalized_snapshot()
    assert res["epoch"] > 1

    # first implementation of waiting for scheduler
    # TODO below
    # https://viniciuschiele.github.io/flask-apscheduler/rst/api.html
    # /scheduler/jobs [GET] > returns json with details of all jobs
    # /scheduler/jobs/<job_id>/run [POST
    time.sleep(120)

    res = client.get_withdrawals_for_address(address=ua_alice.address)
    assert res["amount"] == alice_budget
