from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from v2.allocations.repositories import sum_allocations_by_epoch
from v2.projects.contracts import ProjectsContracts


@dataclass
class ProjectsAllocationThresholdGetter:
    # Parameters
    epoch_number: int

    # Dependencies
    session: AsyncSession
    projects: ProjectsContracts

    async def get(self) -> int:
        return await get_projects_allocation_threshold(
            session=self.session,
            projects=self.projects,
            epoch_number=self.epoch_number,
        )


async def get_projects_allocation_threshold(
    # Dependencies
    session: AsyncSession,
    projects: ProjectsContracts,
    # Arguments
    epoch_number: int,
) -> int | None:
    # We do not use threshold for epoch 4 and above - it's not needed
    if epoch_number >= 4:
        return None

    if epoch_number in [1, 2]:
        project_count_multiplier = 2
    else:
        project_count_multiplier = 1

    total_allocated = await sum_allocations_by_epoch(session, epoch_number)
    project_addresses = await projects.get_project_addresses(epoch_number)

    return _calculate_threshold(
        total_allocated, len(project_addresses), project_count_multiplier
    )


def _calculate_threshold(
    total_allocated: int,
    projects_count: int,
    project_count_multiplier: int,
) -> int:
    return (
        int(total_allocated / (projects_count * project_count_multiplier))
        if projects_count
        else 0
    )
