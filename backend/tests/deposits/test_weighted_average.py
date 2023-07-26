import pytest
from eth_utils import to_checksum_address

from app.core.deposits.deposits import (
    get_users_deposits,
    get_estimated_effective_deposit,
)
from app.extensions import graphql_client

USER1_ADDRESS = "0xabcdef7890123456789012345678901234567893"


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
                    "timestamp": 2000,
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
                    "amount": "100_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1554,
                    "amount": "120_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1746,
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
                    "amount": "100_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1554,
                    "amount": "120_000000000_000000000",
                },
                {
                    "__typename": "Locked",
                    "timestamp": 1746,
                    "amount": "200_448372019_117283735",
                },
            ],
            {
                "effective_deposit": "119_433886492_855795712",
                "epoch_end_deposit": "320_448372019_117283735",
            },
        ),
    ],
)
def test_update_user_deposits(app, mocker, events, expected):
    """Epochs start == 1000, epoch end == 2000"""

    epoch = 1
    deposit_before = 0

    _mock_graphql(mocker, events, deposit_before)

    user_deposits, total_ed = get_users_deposits(epoch)

    if expected is not None:
        assert user_deposits[0].user_address == to_checksum_address(USER1_ADDRESS)
        assert user_deposits[0].effective_deposit == int(expected["effective_deposit"])
        assert user_deposits[0].deposit == int(expected["epoch_end_deposit"])

        assert total_ed == int(expected["effective_deposit"])
    else:
        assert user_deposits == []


def test_estimated_effective_deposit_when_user_has_events(mocker, app):
    """Epochs start == 1000, epoch end == 2000"""
    events = [
        {
            "__typename": "Locked",
            "timestamp": 1500,
            "amount": "1000_000000000_000000000",
        },
        {
            "__typename": "Unlocked",
            "timestamp": 1750,
            "amount": "500_000000000_000000000",
        },
    ]

    _mock_graphql(mocker, events, with_epochs=False)

    result = get_estimated_effective_deposit(1000, 2000, USER1_ADDRESS)

    assert result == 375_000000000_000000000


def test_estimated_effective_deposit_when_user_does_not_have_events(mocker, app):
    """Epochs start == 1000, epoch end == 2000"""
    _mock_graphql(mocker, [], with_epochs=False)

    result = get_estimated_effective_deposit(1000, 2000, USER1_ADDRESS)

    assert result == 0


def _mock_graphql(mocker, events, deposit_before=0, with_epochs=True):
    locks = []
    unlocks = []
    for event in events:
        if event["__typename"] == "Locked":
            locks.append(
                {
                    "depositBefore": str(deposit_before),
                    "user": USER1_ADDRESS,
                    **event,
                }
            )
            deposit_before += int(event["amount"])
        else:
            unlocks.append(
                {
                    "depositBefore": str(deposit_before),
                    "user": USER1_ADDRESS,
                    **event,
                }
            )
            deposit_before -= int(event["amount"])

    # Mock the execute method of the GraphQL client
    mocker.patch.object(graphql_client, "execute")

    # Define the mock responses for the execute method
    gql_execution = []
    if with_epochs:
        gql_execution.append({"epoches": [{"fromTs": 1000, "toTs": 2000}]})

    gql_execution += [
        {"lockeds": locks},
        {"unlockeds": unlocks},
    ]

    graphql_client.execute.side_effect = gql_execution
