import pytest
from freezegun import freeze_time

from app import exceptions, database as db
from app.utils.time import now

from app.core.user.patron_mode import (
    get_patron_mode_status,
    toggle_patron_mode,
    get_patrons_at_timestamp,
)


@pytest.fixture(autouse=True)
def before(request, app, alice, bob):
    db.user.add_user(alice.address)
    db.user.add_user(bob.address)

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
    assert get_patrons_at_timestamp(now()) == []


def test_returns_alice_in_patrons_list(alice):
    toggle_patron_mode(alice.address)
    assert get_patrons_at_timestamp(now()) == [alice.address]


def test_filters_patrons_by_selected_timestamp(alice):
    timestamp_before_toggle = now()

    toggle_patron_mode(alice.address)

    assert get_patrons_at_timestamp(timestamp_before_toggle) == []
    assert get_patrons_at_timestamp(now()) == [alice.address]


def test_subsequent_toggles_do_not_change_patron_mode_at_timestamp(alice, bob):
    toggle_patron_mode(alice.address)
    toggle_patron_mode(alice.address)  # alice is not a patron

    toggle_patron_mode(bob.address)  # bob is a patorn

    timestamp_after_first_serie = now()

    toggle_patron_mode(alice.address)  # alice is a patron
    toggle_patron_mode(bob.address)  # bob is not a patron

    assert get_patrons_at_timestamp(timestamp_after_first_serie) == [bob.address]
    assert get_patron_mode_status(alice.address)
    assert not get_patron_mode_status(bob.address)


def test_patrons_list_works_properly_for_a_series_of_toggles(alice, bob):
    toggle_patron_mode(alice.address)
    toggle_patron_mode(alice.address)

    toggle_patron_mode(bob.address)

    assert get_patrons_at_timestamp(now()) == [bob.address]

    toggle_patron_mode(alice.address)
    toggle_patron_mode(bob.address)
    assert get_patrons_at_timestamp(now()) == [alice.address]

    toggle_patron_mode(bob.address)
    assert get_patrons_at_timestamp(now()) == [bob.address, alice.address]

    toggle_patron_mode(bob.address)
    toggle_patron_mode(alice.address)
    assert get_patrons_at_timestamp(now()) == []
