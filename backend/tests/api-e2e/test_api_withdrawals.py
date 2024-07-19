import time

import pytest

from flask import current_app as app
from app.extensions import w3, vault
from app.legacy.core import vault as vault_core
from app.legacy.core.projects import get_projects_addresses
from tests.helpers.constants import STARTING_EPOCH
from tests.conftest import Client, UserAccount


@pytest.mark.api
def test_withdrawals(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
    ua_bob: UserAccount,
    ua_carol: UserAccount,
    setup_funds,
):
    res, _ = client.sync_status()
    assert res["indexedEpoch"] == res["blockchainEpoch"]
    assert res["indexedEpoch"] > 0

    alice_proposals = get_projects_addresses(1)[:3]
    bob_proposals = get_projects_addresses(1)[:3]
    carol_proposals = get_projects_addresses(1)[:3]

    # lock GLM for three accounts
    ua_alice.lock(10000)
    ua_bob.lock(10000)
    ua_carol.lock(10000)

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

    # save account budget for assertion
    res = client.get_rewards_budget(address=ua_alice.address, epoch=STARTING_EPOCH)
    alice_budget = int(res["budget"])

    # make empty vote to get personal rewards
    ua_alice.allocate(0, alice_proposals)

    # save account budget for assertion
    res = client.get_rewards_budget(address=ua_bob.address, epoch=STARTING_EPOCH)
    bob_budget = int(res["budget"])

    # make empty vote to get personal rewards
    ua_bob.allocate(0, bob_proposals)

    # save account budget for assertion
    res = client.get_rewards_budget(address=ua_carol.address, epoch=STARTING_EPOCH)
    carol_budget = int(res["budget"])

    # make empty vote to get personal rewards
    ua_carol.allocate(0, carol_proposals)

    # TODO replace with helper to wait until end of voting
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 2)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a finalized snapshot
    # res = client.pending_snapshot()
    res = client.finalized_snapshot()
    assert res["epoch"] == STARTING_EPOCH

    # write merkle root for withdrawals
    vault_core.confirm_withdrawals()

    while not vault.is_merkle_root_set(STARTING_EPOCH):
        time.sleep(1)

    root = vault.get_merkle_root(STARTING_EPOCH).hex()
    app.logger.debug(f"root is 0x{root}")

    # Save latest withdrawals for assertions
    alice_withdrawals = client.get_withdrawals_for_address(address=ua_alice.address)[0]
    bob_withdrawals = client.get_withdrawals_for_address(address=ua_bob.address)[0]
    carol_withdrawals = client.get_withdrawals_for_address(address=ua_carol.address)[0]

    assert alice_withdrawals["proof"], "Merkle proof in response is empty"
    assert bob_withdrawals["proof"], "Merkle proof in response is empty"
    assert carol_withdrawals["proof"], "Merkle proof in response is empty"

    # Alice withdrawal
    alice_withdrawal_amount: int = int(alice_withdrawals["amount"])
    assert alice_withdrawal_amount == alice_budget

    # Bob withdrawal
    epoch: int = int(bob_withdrawals["epoch"])
    bob_withdrawal_amount: int = int(bob_withdrawals["amount"])
    assert bob_withdrawal_amount == bob_budget
    bob_merkle_proof: list[str] = bob_withdrawals["proof"]
    app.logger.debug(f"Bob Merkle proof: {bob_merkle_proof}")

    bob_wallet_before_withdraw = w3.eth.get_balance(ua_bob.address)
    app.logger.debug(
        f"Bob Wallet balance before withdrawal: {bob_wallet_before_withdraw}"
    )

    ua_bob.withdraw(epoch, bob_withdrawal_amount, bob_merkle_proof)
    bob_wallet_after_withdraw = w3.eth.get_balance(ua_bob.address)
    app.logger.debug(
        f"Bob Wallet balance after withdrawal: {bob_wallet_after_withdraw}"
    )
    assert bob_wallet_after_withdraw > bob_wallet_before_withdraw

    # Carol withdrawal
    epoch: int = int(carol_withdrawals["epoch"])
    carol_withdrawal_amount: int = int(carol_withdrawals["amount"])
    assert carol_withdrawal_amount == carol_budget
    carol_merkle_proof: list[str] = carol_withdrawals["proof"]
    app.logger.debug(f"Carol Merkle proof: {carol_merkle_proof}")

    carol_wallet_before_withdraw = w3.eth.get_balance(ua_carol.address)
    app.logger.debug(
        f"Carol Wallet balance before withdrawal: {carol_wallet_before_withdraw}"
    )

    ua_carol.withdraw(epoch, carol_withdrawal_amount, carol_merkle_proof)
    carol_wallet_after_withdraw = w3.eth.get_balance(ua_carol.address)
    app.logger.debug(
        f"Carol Wallet balance after withdrawal: {bob_wallet_after_withdraw}"
    )
    assert carol_wallet_after_withdraw > carol_wallet_before_withdraw
