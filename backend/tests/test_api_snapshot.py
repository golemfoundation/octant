import pytest

import json
from app.crypto.account import Account

from app.extensions import w3, epochs, deposits, glm


"""
Please note that tests here assume that they talk to blockchain and indexer
whose state is not reset between tests.
"""

DEPLOYER_PRIV = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ALICE = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
BOB = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"


@pytest.mark.api
def test_root(client):
    rv = client.get("/")
    assert b"Octant API" in rv.data


def wait_for_sync(c, target):
    while True:
        rv = c.get("/info/sync-status").data.decode("utf-8")
        res = json.loads(rv)
        print(
            f'waiting for {target}, chain perceived by indexer: {res["blockchainEpoch"]}, indexing state: {res["indexedEpoch"]}'
        )
        if res["indexedEpoch"] == target:
            return res["indexedEpoch"]


@pytest.mark.api
def test_pending_snapshot(client):
    rv = client.get("/info/sync-status").data.decode("utf-8")
    res = json.loads(rv)
    assert res["indexedEpoch"] == res["blockchainEpoch"]
    assert res["indexedEpoch"] > 0

    # fund Octant
    deployer = Account.from_key(DEPLOYER_PRIV)
    proceeds_addr = client.app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"]
    signed_txn = w3.eth.account.sign_transaction(
        dict(
            nonce=w3.eth.get_transaction_count(deployer.address),
            gasPrice=w3.eth.gas_price,
            gas=1000000,
            to=proceeds_addr,
            value=w3.to_wei(400, "ether"),
        ),
        deployer.key,
    )
    w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    eth_proceeds = w3.eth.get_balance(proceeds_addr)
    eth_proceeds = w3.from_wei(eth_proceeds, "ether")
    assert eth_proceeds > 0

    # lock GLM from two accounts
    alice = Account.from_key(ALICE)
    glm.transfer(deployer, alice.address, w3.to_wei(10000, "ether"))
    glm.approve(alice, deposits.contract.address, w3.to_wei(10000, "ether"))
    deposits.lock(alice, w3.to_wei(10000, "ether"))

    # forward time to the end of the epoch
    assert epochs.get_current_epoch() == 1
    now = w3.eth.get_block("latest").timestamp
    nextEpochAt = epochs.get_current_epoch_end()
    forward = nextEpochAt - now + 10
    w3.provider.make_request("evm_increaseTime", [forward])
    w3.provider.make_request("evm_mine", [])
    assert epochs.get_current_epoch() == 2

    # wait for indexer to catch up
    epoch_no = wait_for_sync(client, 2)
    print(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.post("/snapshots/pending")
    res = res.data.decode("utf-8")
    res = json.loads(res)
    assert res["epoch"] > 0

    # check if users have a budget
    res = client.get(f"/rewards/budget/{alice.address}/epoch/1").data.decode("utf-8")
    res = json.loads(res)
    assert int(res["budget"]) > 0
