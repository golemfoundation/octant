import pytest
import logging
from tests.helpers.constants import STARTING_EPOCH
from tests.api_e2e.conftest import FastAPIClient, FastUserAccount


@pytest.mark.api
@pytest.mark.asyncio
async def test_epochs_basics(
    fclient: FastAPIClient,
    deployer: FastUserAccount,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    setup_funds,
):
    # Check current epoch
    (
        current_epoch,
        response_code,
    ) = fclient.get_current_epoch()
    assert int(current_epoch["currentEpoch"]) == STARTING_EPOCH
    assert response_code == 200

    # check indexed epoch
    indexed_epoch, response_code = fclient.get_indexed_epoch()
    assert int(indexed_epoch["currentEpoch"]) == STARTING_EPOCH
    assert int(indexed_epoch["indexedEpoch"]) == STARTING_EPOCH
    assert response_code == 200

    # Check epoch info
    (
        epoch_info,
        response_code,
    ) = fclient.get_epoch_info(STARTING_EPOCH)

    logging.debug(f"Epoch {STARTING_EPOCH} info:\n{epoch_info}")

    assert "stakingProceeds" in epoch_info
    assert "totalEffectiveDeposit" in epoch_info
    assert "totalRewards" in epoch_info
    assert "vanillaIndividualRewards" in epoch_info
    assert "operationalCost" in epoch_info
    assert "totalWithdrawals" in epoch_info
    assert "patronsRewards" in epoch_info
    assert "matchedRewards" in epoch_info
    assert "leftover" in epoch_info
    assert "ppf" in epoch_info
    assert "communityFund" in epoch_info
    assert response_code == 200

    # forward time to the beginning of the epoch 2
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)
    # wait for indexer to catch up
    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 1)
    logging.debug(f"indexed epoch: {epoch_no}")

    # Check current epoch in following epoch
    current_epoch, _ = fclient.get_current_epoch()
    assert int(current_epoch["currentEpoch"]) == STARTING_EPOCH + 1

    # Check indexed epoch in following epoch
    indexed_epoch, _ = fclient.get_indexed_epoch()
    assert int(indexed_epoch["currentEpoch"]) == STARTING_EPOCH + 1
    assert int(indexed_epoch["indexedEpoch"]) == STARTING_EPOCH + 1
