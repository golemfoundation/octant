import pytest

from app.controllers.deposits import (
    get_user_estimated_effective_deposit_for_current_epoch,
)

from tests.helpers import (
    generate_epoch_events,
    create_deposit_events,
)
from tests.conftest import (
    mock_graphql,
    MOCK_EPOCHS,
    USER1_ADDRESS,
)

epochs = generate_epoch_events(start=1000, epoches=2)


@pytest.fixture
def events():
    return create_deposit_events({USER1_ADDRESS: [(1500, 200000000000000000000)]})


@pytest.fixture(autouse=True)
def before(app, mocker, patch_epochs, graphql_client, events):
    mock_graphql(mocker, epochs_events=epochs, deposit_events=events)


def test_estimated_effective_deposit_in_epoch_1():
    MOCK_EPOCHS.get_current_epoch.return_value = 1

    result = get_user_estimated_effective_deposit_for_current_epoch(USER1_ADDRESS)
    assert result == 100000000000000000000


def test_estimated_effective_deposit_in_epoch_2():
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(USER1_ADDRESS)
    assert result == 200000000000000000000


@pytest.mark.parametrize(
    "events",
    [
        create_deposit_events(
            {
                USER1_ADDRESS: [
                    (1500, 200000000000000000000),
                    (1700, -100000000000000000000),
                ]
            }
        )
    ],
)
def test_estimated_effective_deposit_in_epoch_2_lock_unlock_events(user_accounts):
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(USER1_ADDRESS)
    assert result == 100000000000000000000


@pytest.mark.parametrize(
    "events",
    [
        create_deposit_events(
            {
                USER1_ADDRESS: [
                    (1200, 200000000000000000000),
                    (1700, 100000000000000000000),
                ]
            }
        )
    ],
)
def test_estimated_effective_deposit_in_epoch_2_two_lock_events(user_accounts):
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(USER1_ADDRESS)
    assert result == 300000000000000000000


@pytest.mark.parametrize(
    "events",
    [
        create_deposit_events(
            {
                USER1_ADDRESS: [
                    (1200, 200000000000000000000),
                    (2700, 100000000000000000000),
                ]
            }
        )
    ],
)
def test_estimated_effective_deposit_in_epoch_2_locks_in_epoch_1_and_2():
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(USER1_ADDRESS)
    assert result == 230000000000000000000


@pytest.mark.parametrize(
    "events",
    [
        create_deposit_events(
            {
                USER1_ADDRESS: [
                    (1200, 200000000000000000000),
                    (2700, -100000000000000000000),
                ]
            }
        )
    ],
)
def test_estimated_effective_deposit_in_epoch_2_locks_in_epoch_1_and_unlock_in_2():
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(USER1_ADDRESS)

    assert result == 100000000000000000000
