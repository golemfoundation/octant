import pytest


from app.extensions import w3, epochs
from .conftest import Client, UserAccount

# Please note that tests here assume that they talk to blockchain and indexer
# whose state is not reset between tests.


@pytest.mark.api
def test_root(client):
    res = client.root()
    assert "Octant API" in res


def wait_for_sync(client: Client, target):
    while True:
        res = client.sync_status()
        print(
            f'waiting for {target}, chain perceived by indexer: {res["blockchainEpoch"]}, indexing state: {res["indexedEpoch"]}'
        )
        if res["indexedEpoch"] == target:
            return res["indexedEpoch"]


def move_to_next_epoch():
    assert epochs.get_current_epoch() == 1
    now = w3.eth.get_block("latest").timestamp
    nextEpochAt = epochs.get_current_epoch_end()
    forward = nextEpochAt - now + 10
    w3.provider.make_request("evm_increaseTime", [forward])
    w3.provider.make_request("evm_mine", [])
    assert epochs.get_current_epoch() == 2


@pytest.mark.api
def test_pending_snapshot(client: Client, deployer: UserAccount, account: UserAccount):
    res = client.sync_status()
    assert res["indexedEpoch"] == res["blockchainEpoch"]
    assert res["indexedEpoch"] > 0

    # fund Octant
    deployer.fund_octant(
        address=client.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"], value=400
    )

    # lock GLM from two accounts
    deployer.transfer(account, 10000)
    account.lock(10000)

    # forward time to the end of the epoch
    move_to_next_epoch()

    # wait for indexer to catch up
    epoch_no = wait_for_sync(client, 2)
    print(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # check if users have a budget
    res = client.get_rewards_budget(address=account.address, epoch=1)
    assert int(res["budget"]) > 0
