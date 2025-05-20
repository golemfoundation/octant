import pytest
import logging
from app.extensions import w3

from tests.helpers.constants import STARTING_EPOCH
from tests.api_e2e.conftest import FastAPIClient, FastUserAccount


@pytest.mark.api
@pytest.mark.asyncio
async def test_deposit_basics(
    fclient: FastAPIClient,
    deployer: FastUserAccount,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    setup_funds,
):
    # Check effective deposit before first GLM lock
    (
        total_effective_estimated_before_lock,
        response_code,
    ) = fclient.get_total_effective_estimated()
    assert int(total_effective_estimated_before_lock["totalEffective"]) == 0
    assert response_code == 200

    user_deposit1_before_lock, response_code = fclient.get_user_deposit(
        ua_alice.address, STARTING_EPOCH
    )
    assert int(user_deposit1_before_lock["effectiveDeposit"]) == 0
    assert response_code == 200

    (
        user_estimated_deposit_before_lock,
        response_code,
    ) = fclient.get_user_estimated_effective_deposit(ua_alice.address)
    assert int(user_estimated_deposit_before_lock["effectiveDeposit"]) == 0
    assert response_code == 200

    # Lock GML for one account
    alice_GLM_budget = 10000
    alice_first_lock = 8000
    await deployer.transfer(ua_alice, alice_GLM_budget)
    await ua_alice.lock(alice_first_lock)

    indexed_height = fclient.wait_for_height_sync()
    logging.debug(f"indexed blockchain height: {indexed_height}")

    # Check effective deposit after first GLM lock
    user_deposit_after_lock1, _ = fclient.get_user_deposit(
        ua_alice.address, STARTING_EPOCH
    )
    assert int(user_deposit_after_lock1["effectiveDeposit"]) > 0
    assert int(user_deposit_after_lock1["effectiveDeposit"]) < w3.to_wei(
        alice_first_lock, "ether"
    )

    (
        user_estimated_deposit_after_lock1,
        _,
    ) = fclient.get_user_estimated_effective_deposit(ua_alice.address)
    assert int(user_estimated_deposit_after_lock1["effectiveDeposit"]) > 0
    assert int(user_estimated_deposit_after_lock1["effectiveDeposit"]) < w3.to_wei(
        alice_first_lock, "ether"
    )

    total_effective_estimated_after_lock1, _ = fclient.get_total_effective_estimated()
    assert int(total_effective_estimated_after_lock1["totalEffective"]) > 0
    assert int(total_effective_estimated_after_lock1["totalEffective"]) < w3.to_wei(
        alice_first_lock, "ether"
    )

    # Second GLM lock
    await ua_alice.lock(alice_GLM_budget - alice_first_lock)

    indexed_height = fclient.wait_for_height_sync()
    logging.debug(f"indexed blockchain height: {indexed_height}")

    # Check effective deposit after second GLM lock
    user_deposit_after_lock2, _ = fclient.get_user_deposit(
        ua_alice.address, STARTING_EPOCH
    )
    assert int(user_deposit_after_lock2["effectiveDeposit"]) > int(
        user_deposit_after_lock1["effectiveDeposit"]
    )

    (
        user_estimated_deposit_after_lock2,
        _,
    ) = fclient.get_user_estimated_effective_deposit(ua_alice.address)
    assert int(user_estimated_deposit_after_lock2["effectiveDeposit"]) > int(
        user_estimated_deposit_after_lock1["effectiveDeposit"]
    )

    total_effective_estimated_after_lock2, _ = fclient.get_total_effective_estimated()
    assert int(total_effective_estimated_after_lock2["totalEffective"]) > int(
        total_effective_estimated_after_lock1["totalEffective"]
    )

    # forward time to the beginning of the epoch 2
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)
    # wait for indexer to catch up
    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 1)
    logging.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = fclient.pending_snapshot()
    assert res["epoch"] > 0

    indexed_height = fclient.wait_for_height_sync()
    logging.debug(f"indexed blockchain height: {indexed_height}")

    # Check effective deposit in following epoch (effective deposit from epoch 1 is smaller than deposit in epoch 2)
    user_deposit_epoch1, _ = fclient.get_user_deposit(ua_alice.address, STARTING_EPOCH)
    user_deposit_epoch2, _ = fclient.get_user_deposit(
        ua_alice.address, STARTING_EPOCH + 1
    )
    logging.debug(
        f"User deposit in epoch 1: {user_deposit_epoch1['effectiveDeposit']}, User deposit in epoch 2: {user_deposit_epoch2['effectiveDeposit']}"
    )
    assert int(user_deposit_after_lock2["effectiveDeposit"]) == int(
        user_deposit_epoch1["effectiveDeposit"]
    )
    assert int(user_deposit_epoch1["effectiveDeposit"]) < int(
        user_deposit_epoch2["effectiveDeposit"]
    )
    assert int(user_deposit_epoch2["effectiveDeposit"]) == w3.to_wei(
        alice_GLM_budget, "ether"
    )

    # Check that current user deposit for epoch 2 is equal to epoch 1 GLM locked.
    user_estimated_epoch2, _ = fclient.get_user_estimated_effective_deposit(
        ua_alice.address
    )
    assert int(user_estimated_epoch2["effectiveDeposit"]) == w3.to_wei(
        alice_GLM_budget, "ether"
    )

    # Check that current total deposit for epoch 2 is equal to epoch 1 total GLM locked.
    total_effective_estimated, response_code = fclient.get_total_effective_estimated()
    assert float(total_effective_estimated["totalEffective"]) == w3.to_wei(
        alice_GLM_budget, "ether"
    )
    assert response_code == 200

    # Check that current total deposit for epoch 2 is equal to last effective deposit from epoch 1.
    total_effective_epoch1, response_code = fclient.get_total_effective(STARTING_EPOCH)
    assert int(total_effective_epoch1["totalEffective"]) == int(
        total_effective_estimated_after_lock2["totalEffective"]
    )
    assert response_code == 200

    # Check if locked ratio for Epoch 1 is calculated properly
    locked_ratio, status_code = fclient.get_locked_ratio_in_epoch(STARTING_EPOCH)
    tolerance = 1e-15
    logging.debug(f"GLM Locked Ratio: {locked_ratio['lockedRatio']}")
    assert (
        abs(
            float(locked_ratio["lockedRatio"])
            - float(total_effective_epoch1["totalEffective"])
            / (w3.to_wei(1000000000, "ether"))
        )
        < tolerance
    )
    assert response_code == 200
