from itertools import groupby
from typing import Optional, List

from app.extensions import epochs, projects
from app.infrastructure import database


def get_projects_addresses(epoch: Optional[int]) -> List[str]:
    epoch = epochs.get_current_epoch() if epoch is None else epoch
    return projects.get_project_addresses(epoch)


def get_projects_with_allocations(epoch: int) -> (str, int):
    # Get *all* project allocations in the given epoch
    allocations = database.allocations.get_all_by_epoch(epoch)

    # Group the retrieved projects by the project address
    # and sum up the allocations for each project
    grouped_allocations = groupby(
        sorted(allocations, key=lambda a: a.project_address),
        key=lambda a: a.project_address,
    )

    allocations = [
        (
            project_address,
            sum([int(allocation.amount) for allocation in project_allocations]),
        )
        for project_address, project_allocations in grouped_allocations
    ]

    return allocations
