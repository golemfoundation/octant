from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession
from v2.allocations.repositories import (
    sum_allocations_by_epoch,
)
from v2.projects.contracts import ProjectsContracts


@dataclass
class ProjectsAllocationThresholdGetter:
    # Parameters
    epoch_number: int

    # Dependencies
    session: AsyncSession
    projects: ProjectsContracts
    project_count_multiplier: int = 1

    async def get(self) -> int:
        return await get_projects_allocation_threshold(
            session=self.session,
            projects=self.projects,
            epoch_number=self.epoch_number,
            project_count_multiplier=self.project_count_multiplier,
        )


async def get_projects_allocation_threshold(
    # Dependencies
    session: AsyncSession,
    projects: ProjectsContracts,
    # Arguments
    epoch_number: int,
    project_count_multiplier: int = 1,
) -> int:
    # PROJECTS_COUNT_MULTIPLIER = 1  # TODO: from settings?

    total_allocated = await sum_allocations_by_epoch(session, epoch_number)
    project_addresses = await projects.get_project_addresses(epoch_number)

    print("total_allocated", total_allocated)
    print("project_addresses", project_addresses)

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
