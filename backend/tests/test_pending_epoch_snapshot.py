import pytest

from app import database
from app.controllers.snapshots import snapshot_pending_epoch
from tests.conftest import (
    mock_graphql,
    ETH_PROCEEDS,
    MOCK_EPOCHS,
    MOCKED_PENDING_EPOCH_NO,
    MOCKED_CURRENT_EPOCH_NO,
    create_deposit_event,
)


@pytest.fixture(autouse=True)
def before(patch_glm_and_gnt, patch_epochs, patch_eth_get_balance):
    pass


def test_should_not_make_snapshot_when_it_was_already_taken(
    mock_pending_epoch_snapshot_db,
):
    result = snapshot_pending_epoch()
    assert result is None


def test_take_snapshot_without_effective_deposits(mocker, app, user_accounts):
    user1 = user_accounts[0].address
    user2 = user_accounts[1].address
    events = [
        create_deposit_event(
            amount="200000000000000000000", timestamp=1300, user=user1
        ),
        create_deposit_event(
            amount="400000000000000000000", timestamp=1500, user=user2
        ),
    ]
    mock_graphql(mocker, events)

    result = snapshot_pending_epoch()

    assert result is 42
    snapshot = database.pending_epoch_snapshot.get_last_snapshot()
    assert snapshot.epoch == 42
    assert snapshot.created_at is not None
    assert snapshot.glm_supply == "1000000000000000000000000000"
    assert snapshot.eth_proceeds == str(ETH_PROCEEDS)
    assert snapshot.total_effective_deposit == "0"
    assert snapshot.locked_ratio == "0"
    assert snapshot.all_individual_rewards == "0"
    assert snapshot.total_rewards == "0"

    deposits = database.deposits.get_all_by_epoch(result)
    assert len(deposits) == 2
    assert deposits[user1].user.address == user1
    assert deposits[user1].effective_deposit == "0"
    assert deposits[user1].epoch_end_deposit == "200000000000000000000"
    assert deposits[user2].user.address == user2
    assert deposits[user2].effective_deposit == "0"
    assert deposits[user2].epoch_end_deposit == "400000000000000000000"


def test_take_snapshot_with_effective_deposits(
    mocker, app, user_accounts, mock_pending_epoch_snapshot_db
):
    user1 = user_accounts[0].address
    user2 = user_accounts[1].address
    MOCK_EPOCHS.get_pending_epoch.return_value = MOCKED_PENDING_EPOCH_NO + 1
    MOCK_EPOCHS.get_current_epoch.return_value = MOCKED_CURRENT_EPOCH_NO + 1
    events = [
        create_deposit_event(
            deposit_before="1500000055377000000000",
            amount="200000000000000000000",
            timestamp=1300,
            user=user1,
        ),
        create_deposit_event(
            deposit_before="7500000000000000000000",
            amount="400000000000000000000",
            timestamp=1500,
            user=user2,
        ),
    ]
    mock_graphql(mocker, events)

    result = snapshot_pending_epoch()

    assert result is 43
    snapshot = database.pending_epoch_snapshot.get_last_snapshot()
    assert snapshot.epoch == 43
    assert snapshot.created_at is not None
    assert snapshot.glm_supply == "1000000000000000000000000000"
    assert snapshot.eth_proceeds == str(ETH_PROCEEDS)
    assert snapshot.total_effective_deposit == "9000000055377000000000"
    assert snapshot.locked_ratio == "0.000009000000055377"
    assert snapshot.all_individual_rewards == "3621698652421301"
    assert snapshot.total_rewards == "1207232880426381939"

    deposits = database.deposits.get_all_by_epoch(result)
    assert len(deposits) == 2
    assert deposits[user1].user.address == user1
    assert deposits[user1].effective_deposit == "1500000055377000000000"
    assert deposits[user1].epoch_end_deposit == "1700000055377000000000"
    assert deposits[user2].user.address == user2
    assert deposits[user2].effective_deposit == "7500000000000000000000"
    assert deposits[user2].epoch_end_deposit == "7900000000000000000000"
