import pytest

from app.engine.projects.rewards import ProjectRewardDTO
from app.infrastructure import database
from app.modules.dto import AllocationDTO
from app.modules.user.allocations.service.pending import PendingUserAllocations
from tests.helpers.constants import MATCHED_REWARDS
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_simulate_allocation(mock_users_db, mock_octant_rewards):
    user1, _, _ = mock_users_db
    context = get_context()
    projects = context.projects_details.projects
    prev_allocation = [
        AllocationDTO(projects[0], 100_000000000),
    ]
    database.allocations.add_all(1, user1.id, 0, prev_allocation)

    next_allocations = [
        AllocationDTO(projects[1], 200_000000000),
    ]

    service = PendingUserAllocations(octant_rewards=mock_octant_rewards)

    leverage, threshold, rewards = service.simulate_allocation(
        context, next_allocations, user1.address
    )

    sorted_projects = sorted(projects)
    assert leverage == 1100571991.5775063
    assert threshold == 10_000000000
    assert rewards == [
        ProjectRewardDTO(sorted_projects[0], 0, 0),
        ProjectRewardDTO(sorted_projects[1], 0, 0),
        ProjectRewardDTO(sorted_projects[2], 200_000000000, MATCHED_REWARDS),
        ProjectRewardDTO(sorted_projects[3], 0, 0),
        ProjectRewardDTO(sorted_projects[4], 0, 0),
        ProjectRewardDTO(sorted_projects[5], 0, 0),
        ProjectRewardDTO(sorted_projects[6], 0, 0),
        ProjectRewardDTO(sorted_projects[7], 0, 0),
        ProjectRewardDTO(sorted_projects[8], 0, 0),
        ProjectRewardDTO(sorted_projects[9], 0, 0),
    ]
