import pytest

from app.extensions import db
from app.engine.user.effective_deposit import DepositEvent, EventType
from app.infrastructure import database
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from tests.conftest import mock_graphql, mock_sablier_graphql
from tests.helpers import create_deposit_events, generate_epoch_events
from tests.helpers.constants import (
    ALICE_ADDRESS,
    BOB_ADDRESS,
    CAROL_ADDRESS,
    USER1_ED,
    USER2_ED,
    USER3_ED,
)
from tests.helpers.context import get_context

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
            dave: [(2200, 300), (3200, -300)],
        }
    )


def test_returns_locks_and_unlocks_for_first_epoch(mocker, events):
    mock_graphql(mocker, events, EPOCHS)
    mock_sablier_graphql(mocker)
    context = get_context()
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

    generator = DbAndGraphEventsGenerator()

    assert generator.get_user_events(context, ALICE_ADDRESS) == expected[ALICE_ADDRESS]
    assert generator.get_user_events(context, BOB_ADDRESS) == expected[BOB_ADDRESS]
    assert generator.get_all_users_events(context) == expected


def test_returns_locks_and_unlocks_for_second_epoch(
    mocker, dave, events, mock_pending_epoch_snapshot_db
):
    mock_graphql(mocker, events, EPOCHS)
    mock_sablier_graphql(mocker)
    context = get_context(2, start=2000)
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

    generator = DbAndGraphEventsGenerator()

    assert generator.get_user_events(context, ALICE_ADDRESS) == expected[ALICE_ADDRESS]
    assert generator.get_user_events(context, BOB_ADDRESS) == expected[BOB_ADDRESS]
    assert generator.get_user_events(context, CAROL_ADDRESS) == expected[CAROL_ADDRESS]
    assert generator.get_user_events(context, dave) == expected[dave]

    assert generator.get_all_users_events(context) == expected


def test_returns_events_with_one_element_if_deposit_is_gt_0(mocker, dave, events):
    user = database.user.add_user(dave)
    database.deposits.add(2, user, 300, 300)
    db.session.commit()
    mock_graphql(mocker, events, EPOCHS)
    mock_sablier_graphql(mocker)
    context = get_context(3, start=3000)

    generator = DbAndGraphEventsGenerator()

    assert generator.get_user_events(context, dave) == [
        DepositEvent(
            dave,
            EventType.LOCK,
            timestamp=3000,
            amount=0,
            deposit_before=300,
        ),
        DepositEvent(
            dave,
            EventType.UNLOCK,
            timestamp=3200,
            amount=300,
            deposit_before=300,
        ),
    ]


def test_returns_empty_list_if_there_is_one_event_with_deposit_eq_0(
    mocker, dave, events
):
    user = database.user.add_user(dave)
    database.deposits.add(3, user, 0, 0)
    mock_graphql(mocker, events, EPOCHS)
    mock_sablier_graphql(mocker)
    mock_sablier_graphql(mocker)
    context = get_context(4, start=4000)

    generator = DbAndGraphEventsGenerator()

    assert generator.get_user_events(context, dave) == []


def test_returned_events_are_sorted_by_timestamp(mocker, events):
    mock_graphql(mocker, events, EPOCHS)
    mock_sablier_graphql(mocker)
    context = get_context()

    generator = DbAndGraphEventsGenerator()

    for user in [ALICE_ADDRESS, BOB_ADDRESS]:
        events = generator.get_user_events(context, user)
        for a, b in zip(events, events[1:]):
            assert a.timestamp <= b.timestamp

    for _user, user_events in generator.get_all_users_events(context).items():
        for a, b in zip(user_events, user_events[1:]):
            assert a.timestamp <= b.timestamp
