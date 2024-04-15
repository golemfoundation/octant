import pytest
from freezegun import freeze_time

from app import exceptions
from app.infrastructure import database
from app.legacy.core.user.patron_mode import (
    get_patron_mode_status,
    toggle_patron_mode,
)
from app.modules.common.time import now


@pytest.fixture(autouse=True)
def before(request, app, alice, bob):
    database.user.add_user(alice.address)
    database.user.add_user(bob.address)

    freezer = freeze_time("2023-12-01 12:00:00", tick=True)
    freezer.start()

    request.addfinalizer(lambda: freezer.stop())


def test_raises_exception_for_non_existent_user(carol):
    with pytest.raises(exceptions.UserNotFound):
        get_patron_mode_status(carol.address)


def test_user_is_not_a_patron_by_default(alice, bob):
    assert not get_patron_mode_status(alice.address)
    assert not get_patron_mode_status(bob.address)


def test_first_toggle_changes_user_to_a_patron(alice):
    assert toggle_patron_mode(alice.address)
    assert get_patron_mode_status(alice.address)


def test_another_toggle_disables_patron_mode(alice):
    toggle_patron_mode(alice.address)
    assert not toggle_patron_mode(alice.address)
    assert not get_patron_mode_status(alice.address)


def test_status_changes_accordingly_to_a_series_of_toggles(alice, bob):
    for i in range(0, 10):
        toggle_patron_mode(alice.address)
        assert get_patron_mode_status(alice.address) == (i % 2 == 0)


def test_returns_empty_patrons_list_when_no_events():
    assert database.patrons.get_all_patrons_at_timestamp(now().datetime()) == []


def test_returns_alice_in_patrons_list(alice):
    toggle_patron_mode(alice.address)
    assert database.patrons.get_all_patrons_at_timestamp(now().datetime()) == [
        alice.address
    ]


def test_filters_patrons_by_selected_timestamp(alice):
    timestamp_before_toggle = now().datetime()

    toggle_patron_mode(alice.address)

    assert database.patrons.get_all_patrons_at_timestamp(timestamp_before_toggle) == []
    assert database.patrons.get_all_patrons_at_timestamp(now().datetime()) == [
        alice.address
    ]


def test_subsequent_toggles_do_not_change_patron_mode_at_timestamp(alice, bob):
    toggle_patron_mode(alice.address)
    toggle_patron_mode(alice.address)  # alice is not a patron

    toggle_patron_mode(bob.address)  # bob is a patorn

    timestamp_after_first_serie = now().datetime()

    toggle_patron_mode(alice.address)  # alice is a patron
    toggle_patron_mode(bob.address)  # bob is not a patron

    assert database.patrons.get_all_patrons_at_timestamp(
        timestamp_after_first_serie
    ) == [bob.address]
    assert get_patron_mode_status(alice.address)
    assert not get_patron_mode_status(bob.address)


def test_patrons_list_works_properly_for_a_series_of_toggles(alice, bob):
    toggle_patron_mode(alice.address)
    toggle_patron_mode(alice.address)

    toggle_patron_mode(bob.address)

    assert database.patrons.get_all_patrons_at_timestamp(now().datetime()) == [
        bob.address
    ]

    toggle_patron_mode(alice.address)
    toggle_patron_mode(bob.address)
    assert database.patrons.get_all_patrons_at_timestamp(now().datetime()) == [
        alice.address
    ]

    toggle_patron_mode(bob.address)
    assert database.patrons.get_all_patrons_at_timestamp(now().datetime()) == [
        bob.address,
        alice.address,
    ]

    toggle_patron_mode(bob.address)
    toggle_patron_mode(alice.address)
    assert database.patrons.get_all_patrons_at_timestamp(now().datetime()) == []
