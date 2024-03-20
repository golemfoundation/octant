import pytest
from freezegun import freeze_time

from app.context.helpers import check_if_future


@freeze_time("2024-11-01 01:48:47")
@pytest.mark.parametrize(
    "given_ts, is_future", [(1701216396, False), (1801216396, True)]
)
def test_check_if_future(given_ts, is_future):
    actual_res = check_if_future(given_ts)
    assert actual_res is is_future
