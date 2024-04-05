import pytest

from app.infrastructure import database
from app.modules.common.time import from_timestamp_s
from app.modules.history.dto import PatronDonationItem
from app.modules.user.patron_mode.service.events_based import (
    EventsBasedUserPatronMode,
)
from tests.conftest import mock_graphql
from tests.helpers.context import get_context
from tests.helpers.mocked_epoch_details import create_epoch_event


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_all_patrons(alice, bob, carol):
    context_epoch_1 = get_context(1)
    context_epoch_2 = get_context(2, start=2000)
    database.patrons.add_patron_mode_event(
        alice.address, True, created_at=from_timestamp_s(300).datetime()
    )
    database.patrons.add_patron_mode_event(
        bob.address, True, created_at=from_timestamp_s(2499).datetime()
    )
    database.patrons.add_patron_mode_event(
        carol.address, True, created_at=from_timestamp_s(2501).datetime()
    )

    service = EventsBasedUserPatronMode()

    result_epoch_1 = service.get_all_patrons_addresses(
        context_epoch_1, with_budget=False
    )
    result_epoch_2 = service.get_all_patrons_addresses(
        context_epoch_2, with_budget=False
    )

    assert result_epoch_1 == [bob.address, alice.address]
    assert result_epoch_2 == [carol.address, bob.address, alice.address]


def test_get_all_patrons_with_budget(mock_users_db):
    user1, user2, _ = mock_users_db
    context = get_context(1)
    database.budgets.add(1, user1, 100_000000000)
    database.patrons.add_patron_mode_event(
        user1.address, True, created_at=from_timestamp_s(300).datetime()
    )
    database.patrons.add_patron_mode_event(
        user2.address, True, created_at=from_timestamp_s(2499).datetime()
    )

    service = EventsBasedUserPatronMode()

    result = service.get_all_patrons_addresses(context)

    assert result == [user1.address]


def test_get_patrons_rewards(mock_users_db):
    user1, user2, _ = mock_users_db
    context = get_context(1)
    database.budgets.add(1, user1, 100_000000000)
    database.budgets.add(1, user2, 200_000000000)
    database.patrons.add_patron_mode_event(
        user1.address, True, created_at=from_timestamp_s(300).datetime()
    )
    database.patrons.add_patron_mode_event(
        user2.address, True, created_at=from_timestamp_s(300).datetime()
    )

    service = EventsBasedUserPatronMode()

    result = service.get_patrons_rewards(context)

    assert result == 300_000000000


def test_get_patron_donations_by_timestamp(mocker, mock_users_db):
    user1, _, _ = mock_users_db
    mock_graphql(
        mocker,
        epochs_events=[
            create_epoch_event(
                start=1000,
                end=2000,
                duration=1000,
                decision_window=200,
                epoch=1,
            ),
            create_epoch_event(
                start=2000,
                end=3000,
                duration=1000,
                decision_window=200,
                epoch=2,
            ),
        ],
    )
    context = get_context(3, last_finalized_snapshot_num=2)
    database.budgets.add(1, user1, 100)
    database.budgets.add(2, user1, 200)
    database.patrons.add_patron_mode_event(
        user1.address, True, created_at=from_timestamp_s(0).datetime()
    )

    timestamp_before = from_timestamp_s(2199)
    timestamp_after = from_timestamp_s(3201)

    service = EventsBasedUserPatronMode()

    result_before = service.get_patron_donations(
        context, user1.address, from_timestamp=timestamp_before, limit=20
    )
    result_after = service.get_patron_donations(
        context, user1.address, from_timestamp=timestamp_after, limit=20
    )
    result_after_with_limit = service.get_patron_donations(
        context, user1.address, from_timestamp=timestamp_after, limit=1
    )

    assert result_before == []
    assert result_after == [
        PatronDonationItem(timestamp=from_timestamp_s(3200), epoch=2, amount=200),
        PatronDonationItem(timestamp=from_timestamp_s(2200), epoch=1, amount=100),
    ]
    assert result_after_with_limit == [
        PatronDonationItem(timestamp=from_timestamp_s(3200), epoch=2, amount=200),
    ]
