import pytest

from app.modules.dto import AllocationItem
from app.modules.project_rewards.service.estimated import EstimatedProjectRewards
from tests.helpers import make_user_allocation
from tests.helpers.constants import USER1_BUDGET
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_estimated_project_rewards_with_no_allocations(mock_octant_rewards):
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


def test_estimated_project_rewards_with_allocations(
    mock_octant_rewards, mock_users_db, proposal_accounts
):
    context = get_context(3)

    user, _, _ = mock_users_db
    make_user_allocation(
        context,
        user,
        allocation_items=[AllocationItem(proposal_accounts[0].address, USER1_BUDGET)],
    )

    service = EstimatedProjectRewards(octant_rewards=mock_octant_rewards)
    result = service.get_project_rewards(context)
    project_rewards = result.rewards

    assert len(project_rewards) == 10
    assert project_rewards[0].allocated == 1526868989237987
    for project in project_rewards[1:]:
        assert project.allocated == 0
        assert project.matched == 0

    assert result.total_allocated == 1526868989237987
    assert result.rewards_sum == 220115925184490486394
    assert result.threshold == 152686898923798
