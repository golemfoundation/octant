import pytest
import logging
from tests.helpers.constants import STARTING_EPOCH
from app.extensions import w3
from tests.api_e2e.conftest import FastAPIClient, FastUserAccount


@pytest.mark.api
@pytest.mark.asyncio
async def test_pending_snapshot(
    fclient: FastAPIClient,
    deployer: FastUserAccount,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    setup_funds,
):
    # lock GLM from two accounts
    ua_alice.lock(10000)
    ua_bob.lock(15000)

    # forward time to the beginning of the epoch 2
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 1)
    logging.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = fclient.pending_snapshot()
    assert res["epoch"] > 0

    # check if both users have a budget
    res = fclient.get_user_rewards_in_epoch(
        address=ua_alice.address, epoch=STARTING_EPOCH
    )
    alice_budget = int(res["budget"])
    assert alice_budget > 0

    res = fclient.get_user_rewards_in_epoch(
        address=ua_bob.address, epoch=STARTING_EPOCH
    )
    bob_budget = int(res["budget"])
    assert bob_budget > 0

    # check that user with bigger lock has bigger budget
    assert bob_budget > alice_budget
    logging.debug(f"bob_budget: {bob_budget} while alice_budget: {alice_budget}")


@pytest.mark.api
@pytest.mark.asyncio
async def test_pending_snapshot_basics(
    fclient: FastAPIClient,
    deployer: FastUserAccount,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    setup_funds,
):
    # lock GLM from 1 account
    ua_alice.lock(5000)

    indexed_height = fclient.wait_for_height_sync()
    logging.debug(f"indexed blockchain height: {indexed_height}")

    # Check snapshot status before making pending snapshot
    snapshot_status, status_code = fclient.snapshot_status(STARTING_EPOCH)
    assert snapshot_status["isCurrent"], "Snapshot status should be for current epoch"
    assert not snapshot_status["isPending"], "Snapshot status should not be pending"
    assert not snapshot_status["isFinalized"], "Snapshot status should not be finalized"
    assert status_code == 200

    pending_simulate, status_code = fclient.pending_snapshot_simulate()
    assert "rewards" in pending_simulate
    assert "userDeposits" in pending_simulate
    assert "userBudgets" in pending_simulate
    assert status_code == 200

    # forward time to the beginning of the epoch 2
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 1)
    logging.debug(f"indexed epoch: {epoch_no}")

    # make a pending snapshot
    res = fclient.pending_snapshot()
    assert res["epoch"] == STARTING_EPOCH

    # Check snapshot status after making pending snapshot
    snapshot_status, _ = fclient.snapshot_status(STARTING_EPOCH)
    assert not snapshot_status[
        "isCurrent"
    ], "Snapshot status should not be for current epoch"
    assert snapshot_status["isPending"], "Snapshot status should be pending"
    assert not snapshot_status["isFinalized"], "Snapshot status should not be finalized"
    assert status_code == 200

    pending_simulate, _ = fclient.pending_snapshot_simulate()
    assert int(pending_simulate["rewards"]["totalEffectiveDeposit"]) == w3.to_wei(
        5000, "ether"
    )
    assert len(pending_simulate["userDeposits"]) == 1
    assert len(pending_simulate["userBudgets"]) == 1


@pytest.mark.api
@pytest.mark.asyncio
async def test_finalized_snapshot_basics(
    fclient: FastAPIClient,
    deployer: FastUserAccount,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    setup_funds,
):
    # lock GLM from 1 account
    ua_alice.lock(5000)

    # Check snapshot status before making finalized snapshot
    snapshot_status, status_code = fclient.snapshot_status(STARTING_EPOCH)
    assert snapshot_status["isCurrent"], "Snapshot status should be for current epoch"
    assert not snapshot_status["isPending"], "Snapshot status should not be pending"
    assert not snapshot_status["isFinalized"], "Snapshot status should not be finalized"
    assert status_code == 200

    # forward time to the beginning of the epoch 2
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 1)
    logging.debug(f"indexed epoch: {epoch_no}")

    # make a pending snapshot
    res = fclient.pending_snapshot()
    assert res["epoch"] > 0

    # Check finalized snapshot simulate
    finalized_simulate, status_code = fclient.finalized_snapshot_simulate()
    assert "patronsRewards" in finalized_simulate
    assert "matchedRewards" in finalized_simulate
    assert "projectsRewards" in finalized_simulate
    assert "userRewards" in finalized_simulate
    assert "totalWithdrawals" in finalized_simulate
    assert "leftover" in finalized_simulate
    assert "merkleRoot" in finalized_simulate
    assert status_code == 200

    # forward time to the beginning of the epoch 3
    await fclient.move_to_next_epoch(STARTING_EPOCH + 2)
    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 2)
    logging.debug(f"indexed epoch: {epoch_no}")

    # make a pending snapshot
    res = fclient.pending_snapshot()
    assert res["epoch"] > 1

    # make a finalized snapshot
    res = fclient.finalized_snapshot()
    assert res["epoch"] == STARTING_EPOCH

    # Check snapshot status after making finalized snapshot
    snapshot_status, _ = fclient.snapshot_status(STARTING_EPOCH)
    assert not snapshot_status[
        "isCurrent"
    ], "Snapshot status should not be for current epoch"
    assert not snapshot_status["isPending"], "Snapshot status should not be pending"
    assert snapshot_status["isFinalized"], "Snapshot status should be finalized"
    assert status_code == 200
