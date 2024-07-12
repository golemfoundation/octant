"""
Tests are based on the capped QF & user scores.
"""

import pytest

from app.modules.dto import AllocationItem
from app.modules.projects.rewards.service.estimated import EstimatedProjectRewards
from tests.helpers.allocations import make_user_allocation_with_uq_score
from tests.helpers.constants import USER1_BUDGET, LOW_UQ_SCORE
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_estimated_project_rewards_with_no_allocations(mock_octant_rewards):
    context = get_context(epoch_num=4)

    service = EstimatedProjectRewards(octant_rewards=mock_octant_rewards)
    result = service.get_project_rewards(context)
    project_rewards = result.rewards

    assert len(project_rewards) == 10
    for project in project_rewards:
        assert project.allocated == 0
        assert project.matched == 0

    assert result.total_allocated == 0
    assert result.rewards_sum == 0
    assert result.threshold is None


def test_estimated_project_rewards_with_allocations(
    mock_octant_rewards, mock_users_db_with_scores, project_accounts
):
    context = get_context(epoch_num=4)

    user, _, _ = mock_users_db_with_scores
    make_user_allocation_with_uq_score(
        context,
        user,
        epoch=4,
        uq_score=LOW_UQ_SCORE,
        allocation_items=[AllocationItem(project_accounts[0].address, USER1_BUDGET)],
    )

    service = EstimatedProjectRewards(octant_rewards=mock_octant_rewards)
    result = service.get_project_rewards(context)
    project_rewards = result.rewards

    assert len(project_rewards) == 10
    assert project_rewards[0].allocated == USER1_BUDGET
    for project in project_rewards[1:]:
        assert project.allocated == 0
        assert project.matched == 0

    assert result.total_allocated == USER1_BUDGET
    assert result.rewards_sum == 44024406532089487668
    assert result.threshold is None
