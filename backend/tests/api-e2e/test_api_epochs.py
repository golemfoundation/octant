import pytest

from app.extensions import w3

from tests.conftest import Client, UserAccount
from tests.helpers.constants import STARTING_EPOCH
from flask import current_app as app

# Please note that tests here assume that they talk to blockchain and indexer
# whose state is not reset between tests.


@pytest.mark.api
def test_epochs_basics(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
    ua_bob: UserAccount,
    setup_funds,
):
    # check current epoch
    (
        current_epoch,
        response_code,
    ) = client.get_current_epoch()
    assert int(current_epoch["currentEpoch"]) == STARTING_EPOCH
    assert response_code == 200

    # check indexed epoch
    indexed_epoch, response_code = client.get_indexed_epoch()
    assert int(indexed_epoch["currentEpoch"]) == STARTING_EPOCH
    assert int(indexed_epoch["indexedEpoch"]) == STARTING_EPOCH
    assert response_code == 200

    # check epoch info
    (
        epoch_info,
        response_code,
    ) = client.get_epoch_info(STARTING_EPOCH)

    app.logger.debug(f"Epoch {STARTING_EPOCH} info:\n{epoch_info}")
    assert "stakingProceeds" in epoch_info
    assert "totalEffectiveDeposit" in epoch_info
    assert "totalRewards" in epoch_info
    assert "individualRewards" in epoch_info
    assert "operationalCost" in epoch_info
    assert "totalWithdrawals" in epoch_info
    assert "patronsRewards" in epoch_info
    assert "matchedRewards" in epoch_info
    assert "leftover" in epoch_info
    assert "ppf" in epoch_info
    assert "communityFund" in epoch_info
    assert response_code == 200

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)
    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    current_epoch, _ = client.get_current_epoch()
    assert int(current_epoch["currentEpoch"]) == STARTING_EPOCH + 1

    indexed_epoch, response_code = client.get_indexed_epoch()
    assert int(indexed_epoch["currentEpoch"]) == STARTING_EPOCH + 1
    assert int(indexed_epoch["indexedEpoch"]) == STARTING_EPOCH + 1
