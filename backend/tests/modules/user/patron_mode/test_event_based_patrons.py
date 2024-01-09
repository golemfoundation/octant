import pytest

from app.infrastructure import database
from app.legacy.utils.time import from_timestamp_s
from app.modules.user.patron_mode.service.impl.events_based import (
    EventsBasedUserPatronMode,
)
from tests.helpers.context import get_context


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
