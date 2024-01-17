import pytest

from app.engine.projects.rewards.threshold import ProjectThresholdPayload
from app.engine.projects.rewards.threshold.default import DefaultProjectThreshold


@pytest.mark.parametrize(
    "allocated,projects_count,expected",
    [
        (0, 20, 0),
        (1_000000000_000000000, 5, 100000000_000000000),
        (1_000000000_000000000, 25, 20000000_000000000),
        (9987_443300000, 25, 199_748866000),
        (9987_443300000, 0, 0),
    ],
)
def test_default_threshold(allocated, projects_count, expected):
    payload = ProjectThresholdPayload(allocated, projects_count)
    uut = DefaultProjectThreshold()

    result = uut.calculate_threshold(payload)

    assert result == expected
