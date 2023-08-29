import pytest
from eth_utils import to_checksum_address

from app.core.deposits.deposits import (
    get_users_deposits,
    get_estimated_effective_deposit,
)
from tests.conftest import (
    USER1_ADDRESS,
    mock_graphql,
    create_deposit_event,
    create_epoch_event,
)


@pytest.fixture(autouse=True)
def before(app, graphql_client):
    pass


@pytest.mark.parametrize(
    "events, expected",
    [
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1000,
                    "amount": "400_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1100,
                    "depositBefore": "400_000000000_000000000",
                    "amount": "300_000000000_000000000",
                },
            ],
            {
                "effective_deposit": "670_000000000_000000000",
                "epoch_end_deposit": "700_000000000_000000000",
            },
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1900,
                    "amount": "1000_000000000_000000000",
                },
            ],
            {
                "effective_deposit": "100_000000000_000000000",
                "epoch_end_deposit": "1000_000000000_000000000",
            },
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1999,
                    "amount": "100_000000000_000000000",
                },
            ],
            {"effective_deposit": "0", "epoch_end_deposit": "100_000000000_000000000"},
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1000,
                    "amount": "1000_000000000_000000000",
                },
                {
                    "__typename": "Unlocked",
                    "timestamp": 1999,
                    "depositBefore": "1000_000000000_000000000",
                    "amount": "500_000000000_000000000",
                },
            ],
            {
                "effective_deposit": "999_500000000_000000000",
                "epoch_end_deposit": "500_000000000_000000000",
            },
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1000,
                    "amount": "100_000000000_000000000",
                },
                {
                    "__typename": "Unlocked",
                    "timestamp": 1999,
                    "depositBefore": "100_000000000_000000000",
                    "amount": "50_000000000_000000000",
                },
            ],
            {
                "effective_deposit": "0",
                "epoch_end_deposit": "50_000000000_000000000",
            },
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1100,
                    "amount": "100_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1250,
                    "depositBefore": "100_000000000_000000000",
                    "amount": "100_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1554,
                    "depositBefore": "200_000000000_000000000",
                    "amount": "120_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1746,
                    "depositBefore": "320_000000000_000000000",
                    "amount": "200_448372019_117283735",
                },
            ],
            {
                "effective_deposit": "269_433886492_855795712",
                "epoch_end_deposit": "520_448372019_117283735",
            },
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1100,
                    "amount": "100_000000000_000000000",
                },
                {
                    "__typename": "Unlocked",
                    "timestamp": 1250,
                    "depositBefore": "100_000000000_000000000",
                    "amount": "100_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1554,
                    "depositBefore": "0",
                    "amount": "120_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1746,
                    "depositBefore": "120_000000000_000000000",
                    "amount": "200_448372019_117283735",
                },
            ],
            {
                "effective_deposit": "119_433886492_855795712",
                "epoch_end_deposit": "320_448372019_117283735",
            },
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1100,
                    "amount": "90_000000000_000000000",
                }
            ],
            {
                "effective_deposit": "0",
                "epoch_end_deposit": "90_000000000_000000000",
            },
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1900,
                    "amount": "100_000000000_000000000",
                }
            ],
            {
                "effective_deposit": "10_000000000_000000000",
                "epoch_end_deposit": "100_000000000_000000000",
            },
        ),
        (
            [
                {
                    "__typename": "Locked",
                    "timestamp": 1910,
                    "amount": "100_000000000_000000000",
                }
            ],
            {
                "effective_deposit": "0",
                "epoch_end_deposit": "100_000000000_000000000",
            },
        ),
    ],
)
def test_update_user_deposits(mocker, events, expected):
    """Epochs start == 1000, epoch end == 2000"""

    epoch = 1

    mock_graphql(
        mocker, epochs_events=[create_epoch_event(epoch=epoch)], deposit_events=events
    )

    user_deposits, total_ed = get_users_deposits(epoch)

    if expected is not None:
        assert user_deposits[0].user_address == to_checksum_address(USER1_ADDRESS)
        assert user_deposits[0].effective_deposit == int(expected["effective_deposit"])
        assert user_deposits[0].deposit == int(expected["epoch_end_deposit"])

        assert total_ed == int(expected["effective_deposit"])
    else:
        assert user_deposits == []


def test_estimated_effective_deposit_when_user_has_events(mocker):
    """Epochs start == 1000, epoch end == 2000"""
    events = [
        create_deposit_event(amount="1000_000000000_000000000", timestamp=1500),
        create_deposit_event(
            typename="Unlocked",
            deposit_before="1000_000000000_000000000",
            amount="500_000000000_000000000",
            timestamp=1750,
        ),
    ]
    mock_graphql(mocker, deposit_events=events)

    result = get_estimated_effective_deposit(1000, 2000, USER1_ADDRESS)

    assert result == 375_000000000_000000000


def test_estimated_effective_deposit_when_user_does_not_have_events(mocker):
    """Epochs start == 1000, epoch end == 2000"""
    mock_graphql(mocker, deposit_events=[])

    result = get_estimated_effective_deposit(1000, 2000, USER1_ADDRESS)

    assert result == 0
