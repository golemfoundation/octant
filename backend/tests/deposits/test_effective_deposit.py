import pytest

from app.controllers.deposits import (
    get_user_estimated_effective_deposit_for_current_epoch,
)
from tests.conftest import (
    create_epoch_event,
    mock_graphql,
    create_deposit_event,
    MOCK_EPOCHS,
)

epochs = [
    create_epoch_event(
        start=1000,
        end=2000,
        duration=1000,
        decision_window=500,
        epoch=1,
    ),
    create_epoch_event(
        start=2000,
        end=3000,
        duration=1000,
        decision_window=500,
        epoch=2,
    ),
]


@pytest.fixture
def events():
    return [
        create_deposit_event(
            deposit_before="0", amount="200000000000000000000", timestamp=1500
        )
    ]


@pytest.fixture(autouse=True)
def before(app, mocker, patch_epochs, graphql_client, events):
    mock_graphql(mocker, epochs_events=epochs, deposit_events=events)


def test_estimated_effective_deposit_in_epoch_1(user_accounts):
    MOCK_EPOCHS.get_current_epoch.return_value = 1

    result = get_user_estimated_effective_deposit_for_current_epoch(
        user_accounts[0].address
    )
    assert result == 100000000000000000000


def test_estimated_effective_deposit_in_epoch_2(user_accounts):
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(
        user_accounts[0].address
    )
    assert result == 200000000000000000000


@pytest.mark.parametrize(
    "events",
    [
        [
            create_deposit_event(
                deposit_before="0", amount="200000000000000000000", timestamp=1500
            ),
            create_deposit_event(
                typename="Unlocked",
                deposit_before="200000000000000000000",
                amount="100000000000000000000",
                timestamp=1700,
            ),
        ]
    ],
)
def test_estimated_effective_deposit_in_epoch_2_lock_unlock_events(user_accounts):
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(
        user_accounts[0].address
    )
    assert result == 100000000000000000000


@pytest.mark.parametrize(
    "events",
    [
        [
            create_deposit_event(
                deposit_before="0", amount="200000000000000000000", timestamp=1200
            ),
            create_deposit_event(
                deposit_before="200000000000000000000",
                amount="100000000000000000000",
                timestamp=1700,
            ),
        ]
    ],
)
def test_estimated_effective_deposit_in_epoch_2_two_lock_events(user_accounts):
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(
        user_accounts[0].address
    )
    assert result == 300000000000000000000


@pytest.mark.parametrize(
    "events",
    [
        [
            create_deposit_event(
                deposit_before="0", amount="200000000000000000000", timestamp=1200
            ),
            create_deposit_event(
                deposit_before="200000000000000000000",
                amount="100000000000000000000",
                timestamp=2700,
            ),
        ]
    ],
)
def test_estimated_effective_deposit_in_epoch_2_locks_in_epoch_1_and_2(user_accounts):
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(
        user_accounts[0].address
    )
    assert result == 230000000000000000000


@pytest.mark.parametrize(
    "events",
    [
        [
            create_deposit_event(
                deposit_before="0", amount="200000000000000000000", timestamp=1200
            ),
            create_deposit_event(
                typename="Unlocked",
                deposit_before="200000000000000000000",
                amount="100000000000000000000",
                timestamp=2700,
            ),
        ]
    ],
)
def test_estimated_effective_deposit_in_epoch_2_locks_in_epoch_1_and_unlock_in_2(
    user_accounts,
):
    MOCK_EPOCHS.get_current_epoch.return_value = 2

    result = get_user_estimated_effective_deposit_for_current_epoch(
        user_accounts[0].address
    )
    assert result == 170000000000000000000
