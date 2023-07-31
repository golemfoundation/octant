import pytest
from eth_utils import to_checksum_address

from app import database
from app.core.deposits.deposits import get_users_deposits, calculate_locked_ratio
from tests.conftest import (
    USER1_ADDRESS,
    USER2_ADDRESS,
    mock_graphql,
    create_deposit_event,
)

EPOCH = 42


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
                {
                    "__typename": "Locked",
                    "depositBefore": "400000000000000000000",
                    "amount": "300000000000000000000",
                },
            ],
            {"effective_deposit": "0", "epoch_end_deposit": "700000000000000000000"},
        ),
        (
            None,
            [
                {"__typename": "Locked", "amount": "400000000000000000000"},
                {
                    "__typename": "Unlocked",
                    "depositBefore": "400000000000000000000",
                    "amount": "200000000000000000000",
                },
                {
                    "__typename": "Locked",
                    "depositBefore": "200000000000000000000",
                    "amount": "300000000000000000000",
                },
                {
                    "__typename": "Unlocked",
                    "depositBefore": "500000000000000000000",
                    "amount": "400000000000000000000",
                },
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
                {
                    "__typename": "Locked",
                    "depositBefore": "200000000000000000000",
                    "amount": "400000000000000000000",
                },
                {
                    "__typename": "Locked",
                    "depositBefore": "600000000000000000000",
                    "amount": "500000000000000000000",
                },
            ],
            {
                "effective_deposit": "200000000000000000000",
                "epoch_end_deposit": "1100000000000000000000",
            },
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "200000000000000000000"},
            [
                {
                    "__typename": "Locked",
                    "depositBefore": "200000000000000000000",
                    "amount": "400000000000000000000",
                },
                {
                    "__typename": "Unlocked",
                    "depositBefore": "600000000000000000000",
                    "amount": "500000000000000000000",
                },
                {
                    "__typename": "Locked",
                    "depositBefore": "100000000000000000000",
                    "amount": "700000000000000000000",
                },
            ],
            {
                "effective_deposit": "100000000000000000000",
                "epoch_end_deposit": "800000000000000000000",
            },
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "400000000000000000000"},
            [
                {
                    "__typename": "Unlocked",
                    "depositBefore": "400000000000000000000",
                    "amount": "350000000000000000000",
                },
                {
                    "__typename": "Locked",
                    "depositBefore": "50000000000000000000",
                    "amount": "700000000000000000000",
                },
            ],
            {"effective_deposit": "0", "epoch_end_deposit": "750000000000000000000"},
        ),
        (
            {"effective_deposit": "0", "epoch_end_deposit": "400000000000000000000"},
            [
                {
                    "__typename": "Unlocked",
                    "depositBefore": "400000000000000000000",
                    "amount": "200000000000000000000",
                },
                {
                    "__typename": "Unlocked",
                    "depositBefore": "200000000000000000000",
                    "amount": "200000000000000000000",
                },
            ],
            None,
        ),
        (
            {
                "effective_deposit": "400000000000000000000",
                "epoch_end_deposit": "400000000000000000000",
            },
            [
                {
                    "__typename": "Unlocked",
                    "depositBefore": "400000000000000000000",
                    "amount": "200000000000000000000",
                },
                {
                    "__typename": "Unlocked",
                    "depositBefore": "200000000000000000000",
                    "amount": "200000000000000000000",
                },
            ],
            None,
        ),
        (
            {
                "effective_deposit": "200000000000000000000",
                "epoch_end_deposit": "200000000000000000000",
            },
            [
                {
                    "__typename": "Locked",
                    "depositBefore": "200000000000000000000",
                    "amount": "400000000000000000000",
                },
                {
                    "__typename": "Unlocked",
                    "depositBefore": "600000000000000000000",
                    "amount": "500000000000000000000",
                },
                {
                    "__typename": "Locked",
                    "depositBefore": "100000000000000000000",
                    "amount": "700000000000000000000",
                },
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
def test_get_user_deposits(mocker, state_before, events, expected, app):
    if state_before is not None:
        user = database.user.add_user(USER1_ADDRESS)
        database.deposits.add(
            EPOCH - 1,
            user,
            int(state_before["effective_deposit"]),
            int(state_before["epoch_end_deposit"]),
        )
    mock_graphql(mocker, events)

    user_deposits, total_ed = get_users_deposits(EPOCH)

    if expected is not None:
        assert user_deposits[0].user_address == to_checksum_address(USER1_ADDRESS)
        assert str(user_deposits[0].effective_deposit) == expected["effective_deposit"]
        assert str(user_deposits[0].deposit) == expected["epoch_end_deposit"]

        assert total_ed == int(expected["effective_deposit"])
    else:
        assert user_deposits == []


def test_add_multiple_user_deposits(mocker, app):
    events = [
        create_deposit_event(amount="200000000000000000000"),
        create_deposit_event(amount="400000000000000000000", user=USER2_ADDRESS),
    ]
    mock_graphql(mocker, events)

    user_deposits, total_ed = get_users_deposits(EPOCH)

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
    events = [
        create_deposit_event(
            deposit_before="200000000000000000000", amount="200000000000000000000"
        ),
        create_deposit_event(
            deposit_before="300000000000000000000",
            amount="400000000000000000000",
            user=USER2_ADDRESS,
        ),
    ]

    user1 = database.user.add_user(USER1_ADDRESS)
    user2 = database.user.add_user(USER2_ADDRESS)
    database.deposits.add(
        EPOCH - 1,
        user1,
        200000000000000000000,
        200000000000000000000,
    )
    database.deposits.add(
        EPOCH - 1,
        user2,
        300000000000000000000,
        300000000000000000000,
    )

    mock_graphql(mocker, events)

    user_deposits, total_ed = get_users_deposits(EPOCH)

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
    events = [
        create_deposit_event(amount="200000000000000000000"),
        create_deposit_event(
            deposit_before="300000000000000000000",
            amount="400000000000000000000",
            user=USER2_ADDRESS,
        ),
        create_deposit_event(
            typename="Unlocked",
            deposit_before="700000000000000000000",
            amount="500000000000000000000",
            user=USER2_ADDRESS,
        ),
    ]

    database.user.add_user(USER1_ADDRESS)
    user2 = database.user.add_user(USER2_ADDRESS)

    database.deposits.add(
        EPOCH - 1,
        user2,
        0,
        int(events[1]["depositBefore"]),
    )
    mock_graphql(mocker, events)

    user_deposits, total_ed = get_users_deposits(EPOCH)

    assert len(user_deposits) == 2
    user_deposits = sorted(user_deposits, key=lambda u: u.user_address)

    assert total_ed == 200000000000000000000

    assert user_deposits[0].user_address == USER2_ADDRESS
    assert str(user_deposits[0].effective_deposit) == "200000000000000000000"
    assert str(user_deposits[0].deposit) == "200000000000000000000"

    assert user_deposits[1].user_address == to_checksum_address(USER1_ADDRESS)
    assert str(user_deposits[1].effective_deposit) == "0"
    assert str(user_deposits[1].deposit) == "200000000000000000000"
