import pytest

from app.engine.projects.rewards.threshold import ProjectThresholdPayload
from app.engine.projects.rewards.threshold.preliminary import (
    PreliminaryProjectThreshold,
)


@pytest.mark.parametrize(
    "allocated,projects_count,projects_count_multiplier,expected",
    [
        (0, 20, 1, 0),
        (1_000000000_000000000, 5, 1, 200000000_000000000),
        (1_000000000_000000000, 25, 1, 40000000_000000000),
        (9987_443300000, 25, 1, 399_497732000),
        (9987_443300000, 0, 1, 0),
        (0, 20, 2, 0),
        (1_000000000_000000000, 5, 2, 100000000_000000000),
        (1_000000000_000000000, 25, 2, 20000000_000000000),
        (9987_443300000, 25, 2, 199_748866000),
        (9987_443300000, 0, 2, 0),
    ],
)
def test_preliminary_threshold(
    allocated, projects_count, projects_count_multiplier, expected
):
    payload = ProjectThresholdPayload(allocated, projects_count)
    uut = PreliminaryProjectThreshold(projects_count_multiplier)

    result = uut.calculate_threshold(payload)

    assert result == expected
