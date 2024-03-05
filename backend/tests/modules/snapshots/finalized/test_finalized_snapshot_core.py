from app.modules.dto import ProjectAccountFundsDTO, AllocationDTO
from app.modules.snapshots.finalized.core import get_finalized_project_rewards
from tests.helpers.context import get_context


def test_transform_project_rewards():
    context = get_context()
    projects = context.projects_details.projects
    allocations = [
        AllocationDTO(projects[2], 500),
        AllocationDTO(projects[0], 200),
        AllocationDTO(projects[1], 200),
        AllocationDTO(projects[3], 0),
    ]

    project_rewards, project_rewards_sum = get_finalized_project_rewards(
        context.epoch_settings.project, allocations, projects, 9000
    )

    assert project_rewards == [
        ProjectAccountFundsDTO(projects[2], 5500, 5000),
        ProjectAccountFundsDTO(projects[0], 2200, 2000),
        ProjectAccountFundsDTO(projects[1], 2200, 2000),
    ]
    assert project_rewards_sum == 9900
