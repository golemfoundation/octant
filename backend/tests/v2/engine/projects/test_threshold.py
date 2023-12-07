import pytest

from app.v2.engine.projects import DefaultProjectThreshold
from app.v2.engine.projects.threshold import ProjectThresholdPayload


@pytest.mark.parametrize(
    "allocated,projects_count,expected",
    [
        (0, 20, 0),
        (1_000000000_000000000, 5, 100000000_000000000),
        (1_000000000_000000000, 25, 20000000_000000000),
        (9987_443300000, 25, 199_748866000),
    ],
)
def test_default_threshold(allocated, projects_count, expected):
    payload = ProjectThresholdPayload(allocated, projects_count)
    uut = DefaultProjectThreshold()

    result = uut.calculate_threshold(payload)

    assert result == expected
