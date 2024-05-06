import pytest


from app.extensions import w3, epochs
from app.legacy.core.projects import get_projects_addresses
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

    # check if both users have a budget
    res = client.get_rewards_budget(address=ua_alice.address, epoch=1)
    alice_budget = int(res["budget"])
    assert alice_budget > 0

    res = client.get_rewards_budget(address=ua_bob.address, epoch=1)
    bob_budget = int(res["budget"])
    assert bob_budget > 0


@pytest.mark.api
def test_allocations(
    client: Client, deployer: UserAccount, ua_alice: UserAccount, ua_bob: UserAccount
):
    alice_projects = get_projects_addresses(1)[:3]

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
    print(f"indexed epoch: {epoch_no}, expected 2")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    ua_alice.allocate(1000, alice_projects)
    ua_bob.allocate(1000, alice_projects[:1])

    allocations = client.get_epoch_allocations(1)

    assert len(allocations["allocations"]) == 4
    for allocation in allocations["allocations"]:
        for key, val in allocation.items():
            if key == "amount":
                assert int(val) == 1000
