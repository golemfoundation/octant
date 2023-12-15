import pytest

from app import exceptions
from app.controllers.snapshots import pending_snapshot_status


@pytest.mark.parametrize(
    "epoch, snapshot, expected",
    [
        (1, 1, "not_applicable"),
        (1, 1, "not_applicable"),
        (2, 1, "done"),
        (2, 0, "in_progress"),
        (5, 3, "in_progress"),
        (3, 0, "error"),  # snapshot not performed on time
        (3, 0, "error"),  # snapshot not performed on time
    ],
)
def test_pending_snapshot_status(epoch, snapshot, expected):
    try:
        output = pending_snapshot_status(epoch, snapshot)
    except exceptions.OctantException:
        output = "error"
    assert output == expected
