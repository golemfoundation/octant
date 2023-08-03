import pytest
from freezegun import freeze_time

from app.controllers.epochs import get_current_epoch
from tests.conftest import MOCK_EPOCHS


@pytest.fixture(autouse=True)
def before(app, patch_epochs):
    MOCK_EPOCHS.get_current_epoch.return_value = 2


@freeze_time("2023-07-31 23:59:59")
def test_get_current_epoch_when_is_before_epoch_0_end():
    assert get_current_epoch() == 0


@freeze_time("2023-08-01 00:00:00")
def test_get_current_epoch_when_is_after_epoch_0_end_and_before_epoch_1_end():
    assert get_current_epoch() == 1


@freeze_time("2023-10-31 23:59:59")
def test_get_current_epoch_when_is_before_epoch_1_end():
    assert get_current_epoch() == 1


@freeze_time("2023-11-01 00:00:00")
def test_get_current_epoch_when_is_after_epoch_1_end():
    assert get_current_epoch() == 2


@freeze_time("2023-08-01 01:59:59", tz_offset=+2)
def test_get_current_epoch_when_is_before_epoch_0_end_diff_tz():
    assert get_current_epoch() == 0


@freeze_time("2023-08-01 02:00:00", tz_offset=+2)
def test_get_current_epoch_when_is_after_epoch_0_end_and_before_epoch_1_end_diff_tz():
    assert get_current_epoch() == 1


@freeze_time("2023-11-01 01:59:59", tz_offset=+2)
def test_get_current_epoch_when_is_before_epoch_1_end_diff_tz():
    assert get_current_epoch() == 1


@freeze_time("2023-11-01 02:00:00", tz_offset=+2)
def test_get_current_epoch_when_is_after_epoch_1_end_diff_tz():
    assert get_current_epoch() == 2
