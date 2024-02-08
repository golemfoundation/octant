import pytest

from app.core.epochs.details import get_epoch_details
from app.core.deposits.events import EventType, DepositEvent, EpochEventsGenerator

from tests.conftest import mock_graphql
from tests.helpers.constants import (
    ALICE_ADDRESS,
    BOB_ADDRESS,
    CAROL_ADDRESS,
    USER1_ED,
    USER2_ED,
    USER3_ED,
)
from tests.helpers import create_deposit_events, generate_epoch_events

EPOCHS = generate_epoch_events(start=1000, epoches=3)


@pytest.fixture(autouse=True)
def before(app, graphql_client):
    pass


@pytest.fixture()
def dave(user_accounts):
    return user_accounts[3].address


@pytest.fixture()
def events(dave):
    return create_deposit_events(
        {
            ALICE_ADDRESS: [(1000, 3_300), (1300, USER1_ED - 3300), (2300, 100)],
            BOB_ADDRESS: [
                (1050, 400),
                (1200, -200),
                (1800, USER2_ED - 200),
                (2000, 300),
            ],
            dave: [(2200, 300)],
        }
    )


def test_returns_locks_and_unlocks_for_first_epoch(mocker, events):
    mock_graphql(mocker, events, EPOCHS)
    epoch_details = get_epoch_details(1)
    generator = EpochEventsGenerator(epoch_details)

    expected = {
        ALICE_ADDRESS: [
            DepositEvent(
                ALICE_ADDRESS,
                EventType.LOCK,
                timestamp=1000,
                amount=0,
                deposit_before=0,
            ),
            DepositEvent(
                ALICE_ADDRESS,
                EventType.LOCK,
                timestamp=1000,
                amount=3300,
                deposit_before=0,
            ),
            DepositEvent(
                ALICE_ADDRESS,
                EventType.LOCK,
                timestamp=1300,
                amount=USER1_ED - 3300,
                deposit_before=3300,
            ),
        ],
        BOB_ADDRESS: [
            DepositEvent(
                BOB_ADDRESS,
                EventType.LOCK,
                timestamp=1000,
                amount=0,
                deposit_before=0,
            ),
            DepositEvent(
                BOB_ADDRESS,
                EventType.LOCK,
                timestamp=1050,
                amount=400,
                deposit_before=0,
            ),
            DepositEvent(
                BOB_ADDRESS,
                EventType.UNLOCK,
                timestamp=1200,
                amount=200,
                deposit_before=400,
            ),
            DepositEvent(
                BOB_ADDRESS,
                EventType.LOCK,
                timestamp=1800,
                amount=USER2_ED - 200,
                deposit_before=200,
            ),
        ],
    }

    assert generator.get_user_events(ALICE_ADDRESS) == expected[ALICE_ADDRESS]
    assert generator.get_user_events(BOB_ADDRESS) == expected[BOB_ADDRESS]
    assert generator.get_all_users_events() == expected


def test_returns_locks_and_unlocks_for_second_epoch(
    mocker, dave, events, mock_pending_epoch_snapshot_db
):
    mock_graphql(mocker, events, EPOCHS)
    epoch_details = get_epoch_details(2)
    generator = EpochEventsGenerator(epoch_details)

    expected = {
        ALICE_ADDRESS: [
            DepositEvent(
                ALICE_ADDRESS,
                EventType.LOCK,
                timestamp=2000,
                amount=0,
                deposit_before=USER1_ED,
            ),
            DepositEvent(
                ALICE_ADDRESS,
                EventType.LOCK,
                timestamp=2300,
                amount=100,
                deposit_before=USER1_ED,
            ),
        ],
        BOB_ADDRESS: [
            DepositEvent(
                BOB_ADDRESS,
                EventType.LOCK,
                timestamp=2000,
                amount=0,
                deposit_before=USER2_ED,
            ),
            DepositEvent(
                BOB_ADDRESS,
                EventType.LOCK,
                timestamp=2000,
                amount=300,
                deposit_before=USER2_ED,
            ),
        ],
        CAROL_ADDRESS: [
            DepositEvent(
                CAROL_ADDRESS,
                EventType.LOCK,
                timestamp=2000,
                amount=0,
                deposit_before=USER3_ED,
            ),
        ],
        dave: [
            DepositEvent(
                dave,
                EventType.LOCK,
                timestamp=2000,
                amount=0,
                deposit_before=0,
            ),
            DepositEvent(
                dave,
                EventType.LOCK,
                timestamp=2200,
                amount=300,
                deposit_before=0,
            ),
        ],
    }

    assert generator.get_user_events(ALICE_ADDRESS) == expected[ALICE_ADDRESS]
    assert generator.get_user_events(BOB_ADDRESS) == expected[BOB_ADDRESS]
    assert generator.get_user_events(CAROL_ADDRESS) == expected[CAROL_ADDRESS]
    assert generator.get_user_events(dave) == expected[dave]

    assert generator.get_all_users_events() == expected


def test_returned_events_are_sorted_by_timestamp(mocker, events):
    mock_graphql(mocker, events, EPOCHS)
    epoch_details = get_epoch_details(1)
    generator = EpochEventsGenerator(epoch_details)

    for user in [ALICE_ADDRESS, BOB_ADDRESS]:
        events = generator.get_user_events(user)
        for a, b in zip(events, events[1:]):
            assert a.timestamp <= b.timestamp

    for _user, user_events in generator.get_all_users_events().items():
        for a, b in zip(user_events, user_events[1:]):
            assert a.timestamp <= b.timestamp
