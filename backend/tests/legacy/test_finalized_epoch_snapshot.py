import pytest

from app import exceptions
from app.legacy.controllers.snapshots import finalized_snapshot_status


@pytest.mark.parametrize(
    "epoch, snapshot, is_open, expected",
    [
        (1, 1, False, "not_applicable"),
        (1, 1, True, "not_applicable"),
        (2, 1, False, "done"),
        (2, 1, True, "error"),  # snapshot performed before voting ended, illegal
        (2, 0, True, "too_early"),
        (5, 3, True, "too_early"),
        (2, 0, False, "in_progress"),
        (5, 3, False, "in_progress"),
        (3, 0, True, "error"),  # snapshot not performed on time
        (3, 0, False, "error"),  # snapshot not performed on time
    ],
)
def test_finalized_snapshot_status(epoch, snapshot, is_open, expected):
    try:
        output = finalized_snapshot_status(epoch, snapshot, is_open)
    except exceptions.OctantException:
        output = "error"
    assert output == expected
