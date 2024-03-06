from app.modules.dto import ProjectAccountFundsDTO, AllocationDTO
from app.modules.snapshots.finalized.core import get_finalized_project_rewards


def test_transform_project_rewards(context, projects):
    allocations = [
        AllocationDTO(projects[2], 500),
        AllocationDTO(projects[0], 200),
        AllocationDTO(projects[1], 200),
        AllocationDTO(projects[3], 0),
    ]

    result = get_finalized_project_rewards(
        context.epoch_settings.project, allocations, projects, 9000
    )

    assert result.rewards == [
        ProjectAccountFundsDTO(projects[2], 5500, 5000),
        ProjectAccountFundsDTO(projects[0], 2200, 2000),
        ProjectAccountFundsDTO(projects[1], 2200, 2000),
    ]
    assert result.rewards_sum == 9900
