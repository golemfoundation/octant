from datetime import datetime

import pytest
from freezegun import freeze_time
from app.extensions import db

from app import database

TS_23_10_03 = 1696291200
TS_23_10_04 = 1696377600
TS_23_10_10 = 1696896000


@pytest.fixture(autouse=True)
def before(app):
    pass


@freeze_time("2023-10-04 00:00:00")
def test_get_empty_list_when_no_events():
    result = database.patrons_events.get_all_enabled_patrons(TS_23_10_10)

    assert len(result) == 0


@freeze_time("2023-10-04 00:00:00")
def test_get_enabled_patrons(user_accounts):
    database.patrons_events.toggle_patron_mode(user_accounts[0].address)
    database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    database.patrons_events.toggle_patron_mode(user_accounts[2].address)
    db.session.commit()

    result = database.patrons_events.get_all_enabled_patrons(TS_23_10_10)

    assert len(result) == 3


@freeze_time("2023-10-04 00:00:00")
def test_get_enabled_patrons_addresses(user_accounts):
    database.patrons_events.toggle_patron_mode(user_accounts[0].address)
    database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    database.patrons_events.toggle_patron_mode(user_accounts[2].address)
    db.session.commit()

    result = database.patrons_events.get_all_enabled_patrons(TS_23_10_10)

    assert len(result) == 3
    assert result[0] == user_accounts[0].address
    assert result[1] == user_accounts[1].address
    assert result[2] == user_accounts[2].address


@freeze_time("2023-10-04 00:00:00")
def test_get_patrons_enabled_after_timestamp(user_accounts):
    database.patrons_events.toggle_patron_mode(user_accounts[0].address)
    database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    with freeze_time("2023-10-02 00:00:00"):
        database.patrons_events.toggle_patron_mode(user_accounts[2].address)
    db.session.commit()

    result = database.patrons_events.get_all_enabled_patrons(TS_23_10_03)

    assert len(result) == 1


@freeze_time("2023-10-04 00:00:00")
def test_get_patrons_when_some_are_disabled(user_accounts):
    events_time = (datetime(2023, 10, day) for day in range(4, 8))

    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[0].address)

    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)

    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[2].address)
    db.session.commit()

    result = database.patrons_events.get_all_enabled_patrons(TS_23_10_10)

    assert len(result) == 2


@freeze_time("2023-10-04 00:00:00")
def test_get_reenabled_patrons(user_accounts):
    events_time = (datetime(2023, 10, day) for day in range(4, 8))

    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[0].address)

    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    db.session.commit()

    result = database.patrons_events.get_all_enabled_patrons(TS_23_10_10)

    assert len(result) == 2


@freeze_time("2023-10-04 00:00:00")
def test_get_redisabled_patrons(user_accounts):
    events_time = (datetime(2023, 10, day) for day in range(4, 8))

    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)

    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    with freeze_time(events_time):
        database.patrons_events.toggle_patron_mode(user_accounts[1].address)
    db.session.commit()

    result = database.patrons_events.get_all_enabled_patrons(TS_23_10_10)

    assert len(result) == 0
