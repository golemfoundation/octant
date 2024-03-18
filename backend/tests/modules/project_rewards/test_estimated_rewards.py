import pytest

from app.modules.project_rewards.service.estimated import EstimatedProjectRewards
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_estimated_project_rewards(mock_octant_rewards):
    context = get_context(2)

    service = EstimatedProjectRewards(octant_rewards=mock_octant_rewards)
    result = service.get_project_rewards(context)
    project_rewards = result.rewards

    assert len(project_rewards) == 10
    for project in project_rewards:
        assert project.allocated == 0
        assert project.matched == 0

    assert result.total_allocated == 0
    assert result.rewards_sum == 0
    assert result.threshold == 0
