import pytest

from app.modules.dto import AllocationDTO, ProjectAccountFundsDTO
from app.modules.projects.rewards.service.finalizing import FinalizingProjectRewards


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_finalized_project_rewards(context, projects):
    allocations = [
        AllocationDTO(projects[2], 500),
        AllocationDTO(projects[0], 200),
        AllocationDTO(projects[1], 200),
        AllocationDTO(projects[3], 0),
    ]
    service = FinalizingProjectRewards()
    result = service.get_finalized_project_rewards(context, allocations, projects, 9000)

    assert result.rewards == [
        ProjectAccountFundsDTO(projects[2], 5500, 5000),
        ProjectAccountFundsDTO(projects[0], 2200, 2000),
        ProjectAccountFundsDTO(projects[1], 2200, 2000),
    ]
    assert result.rewards_sum == 9900
