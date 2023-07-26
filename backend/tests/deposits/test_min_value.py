import pytest
from eth_utils import to_checksum_address

from app import database
from app.core.deposits.deposits import get_users_deposits, calculate_locked_ratio
from app.extensions import graphql_client

USER1_ADDRESS = "0xabcdef7890123456789012345678901234567893"
USER2_ADDRESS = "0x2345678901234567890123456789012345678904"


@pytest.mark.parametrize(
    "glm_supply, total_ed, expected",
    [
        (1000000000000000000000000000, 400_000000000_000000000, "0.0000004"),
        (
            985000000000048271659382201,
            9999_999999999_999999999,
            "0.00001015228426395889333237670954",
        ),
        (
            1_000000000_000000000_000000000,
            22700_000000000_099999994,
            "0.000022700000000000099999994",
        ),
        (
            1000000000000000000000000000,
            77659900_000050080_003040099,
            "0.077659900000050080003040099",
        ),
        (
            1000000000000000000000000000,
            111388800_044440000_000000000,
            "0.11138880004444",
        ),
        (1000000000000000000000000000, 422361100_000000000_000000000, "0.4223611"),
        (1000000000000000000000000000, 1000000000_000000000_000000000, "1"),
    ],
)
def test_locked_ratio_positive(glm_supply, total_ed, expected, app):
    result = calculate_locked_ratio(total_ed, glm_supply)
    assert "{:f}".format(result) == expected


@pytest.mark.parametrize(
    "state_before, events, expected",
    [
        (
            None,
            [
                {"__typename": "Locked", "amount": "400000000000000000000"},
                {"__typename": "Locked", "amount": "300000000000000000000"},
            ],
            {"effective_deposit": "0", "epoch_end_deposit": "700000000000000000000"},
        ),
        (
            None,
            [
                {"__typename": "Locked", "amount": "400000000000000000000"},
                {"__typename": "Unlocked", "amount": "200000000000000000000"},
                {"__typename": "Locked", "amount": "300000000000000000000"},
                {"__typename": "Unlocked", "amount": "400000000000000000000"},
            ],
            {"effective_deposit": "0", "epoch_end_deposit": "100000000000000000000"},
        ),
        (
            None,
            [
                {"__typename": "Locked", "amount": "400000000000000000000"},
                {"__typename": "Unlocked", "amount": "400000000000000000000"},
            ],
            None,
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "200000000000000000000"},
            [
                {"__typename": "Locked", "amount": "400000000000000000000"},
                {"__typename": "Locked", "amount": "500000000000000000000"},
            ],
            {
                "effective_deposit": "200000000000000000000",
                "epoch_end_deposit": "1100000000000000000000",
            },
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "200000000000000000000"},
            [
                {"__typename": "Locked", "amount": "400000000000000000000"},
                {"__typename": "Unlocked", "amount": "500000000000000000000"},
                {"__typename": "Locked", "amount": "700000000000000000000"},
            ],
            {
                "effective_deposit": "100000000000000000000",
                "epoch_end_deposit": "800000000000000000000",
            },
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "400000000000000000000"},
            [
                {"__typename": "Unlocked", "amount": "350000000000000000000"},
                {"__typename": "Locked", "amount": "700000000000000000000"},
            ],
            {"effective_deposit": "0", "epoch_end_deposit": "750000000000000000000"},
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "400000000000000000000"},
            [
                {"__typename": "Unlocked", "amount": "200000000000000000000"},
                {"__typename": "Unlocked", "amount": "200000000000000000000"},
            ],
            None,
        ),
        (
            {
                "effective_deposit": "400000000000000000000",
                "epoch_end_deposit": "400000000000000000000",
            },
            [
                {"__typename": "Unlocked", "amount": "200000000000000000000"},
                {"__typename": "Unlocked", "amount": "200000000000000000000"},
            ],
            None,
        ),
        (
            {
                "effective_deposit": "200000000000000000000",
                "epoch_end_deposit": "200000000000000000000",
            },
            [
                {"__typename": "Locked", "amount": "400000000000000000000"},
                {"__typename": "Unlocked", "amount": "500000000000000000000"},
                {"__typename": "Locked", "amount": "700000000000000000000"},
            ],
            {
                "effective_deposit": "100000000000000000000",
                "epoch_end_deposit": "800000000000000000000",
            },
        ),
        (
            {
                "effective_deposit": "200000000000000000000",
                "epoch_end_deposit": "200000000000000000000",
            },
            [],
            {
                "effective_deposit": "200000000000000000000",
                "epoch_end_deposit": "200000000000000000000",
            },
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "200000000000000000000"},
            [],
            {
                "effective_deposit": "200000000000000000000",
                "epoch_end_deposit": "200000000000000000000",
            },
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "100000"},
            [],
            {"effective_deposit": "0", "epoch_end_deposit": "100000"},
        ),
    ],
)
def test_update_user_deposits(mocker, state_before, events, expected, app):
    epoch = 2
    deposit_before = 0

    if state_before is not None:
        deposit_before = int(state_before["epoch_end_deposit"])
        user = database.user.add_user(USER1_ADDRESS)
        database.deposits.add(
            epoch - 1,
            user,
            int(state_before["effective_deposit"]),
            int(state_before["epoch_end_deposit"]),
        )

    _mock_graphql(mocker, events, deposit_before)

    user_deposits, total_ed = get_users_deposits(epoch)

    if expected is not None:
        assert user_deposits[0].user_address == to_checksum_address(USER1_ADDRESS)
        assert str(user_deposits[0].effective_deposit) == expected["effective_deposit"]
        assert str(user_deposits[0].deposit) == expected["epoch_end_deposit"]

        assert total_ed == int(expected["effective_deposit"])
    else:
        assert user_deposits == []


def test_add_multiple_user_deposits(mocker, app):
    epoch = 2

    events = [
        {
            "__typename": "Locked",
            "depositBefore": 0,
            "amount": "200000000000000000000",
            "user": USER1_ADDRESS,
        },
        {
            "__typename": "Locked",
            "depositBefore": 0,
            "amount": "400000000000000000000",
            "user": USER2_ADDRESS,
        },
    ]
    _mock_graphql(mocker, events)

    user_deposits, total_ed = get_users_deposits(epoch)

    assert len(user_deposits) == 2
    user_deposits = sorted(user_deposits, key=lambda u: u.user_address)

    assert total_ed == 0

    assert user_deposits[0].user_address == USER2_ADDRESS
    assert str(user_deposits[0].effective_deposit) == "0"
    assert str(user_deposits[0].deposit) == "400000000000000000000"

    assert user_deposits[1].user_address == to_checksum_address(USER1_ADDRESS)
    assert str(user_deposits[1].effective_deposit) == "0"
    assert str(user_deposits[1].deposit) == "200000000000000000000"


def test_update_multiple_user_deposits(mocker, app):
    epoch = 2

    events = [
        {
            "__typename": "Locked",
            "depositBefore": "200000000000000000000",
            "amount": "200000000000000000000",
            "user": USER1_ADDRESS,
        },
        {
            "__typename": "Locked",
            "depositBefore": "300000000000000000000",
            "amount": "400000000000000000000",
            "user": USER2_ADDRESS,
        },
    ]

    user1 = database.user.add_user(USER1_ADDRESS)
    user2 = database.user.add_user(USER2_ADDRESS)
    database.deposits.add(
        epoch - 1,
        user1,
        200000000000000000000,
        200000000000000000000,
    )
    database.deposits.add(
        epoch - 1,
        user2,
        300000000000000000000,
        300000000000000000000,
    )

    _mock_graphql(mocker, events)

    user_deposits, total_ed = get_users_deposits(epoch)

    assert len(user_deposits) == 2
    user_deposits = sorted(user_deposits, key=lambda u: u.user_address)

    assert total_ed == 500000000000000000000

    assert user_deposits[0].user_address == USER2_ADDRESS
    assert str(user_deposits[0].effective_deposit) == "300000000000000000000"
    assert str(user_deposits[0].deposit) == "700000000000000000000"

    assert user_deposits[1].user_address == to_checksum_address(USER1_ADDRESS)
    assert str(user_deposits[1].effective_deposit) == "200000000000000000000"
    assert str(user_deposits[1].deposit) == "400000000000000000000"


def test_add_and_update_deposits(mocker, app):
    epoch = 2

    events = [
        {
            "__typename": "Locked",
            "depositBefore": "0",
            "amount": "200000000000000000000",
            "user": USER1_ADDRESS,
        },
        {
            "__typename": "Locked",
            "depositBefore": "300000000000000000000",
            "amount": "400000000000000000000",
            "user": USER2_ADDRESS,
        },
        {
            "__typename": "Unlocked",
            "depositBefore": "700000000000000000000",
            "amount": "500000000000000000000",
            "user": USER2_ADDRESS,
        },
    ]

    database.user.add_user(USER1_ADDRESS)
    user2 = database.user.add_user(USER2_ADDRESS)

    database.deposits.add(
        epoch - 1,
        user2,
        0,
        int(events[1]["depositBefore"]),
    )
    _mock_graphql(mocker, events)

    user_deposits, total_ed = get_users_deposits(epoch)

    assert len(user_deposits) == 2
    user_deposits = sorted(user_deposits, key=lambda u: u.user_address)

    assert total_ed == 200000000000000000000

    assert user_deposits[0].user_address == USER2_ADDRESS
    assert str(user_deposits[0].effective_deposit) == "200000000000000000000"
    assert str(user_deposits[0].deposit) == "200000000000000000000"

    assert user_deposits[1].user_address == to_checksum_address(USER1_ADDRESS)
    assert str(user_deposits[1].effective_deposit) == "0"
    assert str(user_deposits[1].deposit) == "200000000000000000000"


def _mock_graphql(mocker, events, deposit_before=0):
    timestamp = 1
    locks = []
    unlocks = []
    for event in events:
        if event["__typename"] == "Locked":
            locks.append(
                {
                    "depositBefore": str(deposit_before),
                    "timestamp": timestamp,
                    "user": USER1_ADDRESS,
                    **event,
                }
            )
            deposit_before += int(event["amount"])
        else:
            unlocks.append(
                {
                    "depositBefore": str(deposit_before),
                    "timestamp": timestamp,
                    "user": USER1_ADDRESS,
                    **event,
                }
            )
            deposit_before -= int(event["amount"])
        timestamp += 1

    # Mock the execute method of the GraphQL client
    mocker.patch.object(graphql_client, "execute")

    # Define the mock responses for the execute method
    graphql_client.execute.side_effect = [
        {"epoches": [{"fromTs": 1, "toTs": 1000}]},
        {"lockeds": locks},
        {"unlockeds": unlocks},
    ]
