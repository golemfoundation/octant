from itertools import groupby
from typing import Optional, List

from app.extensions import epochs, proposals
from app.infrastructure import database
from app.infrastructure.database import allocations as allocation_db


def get_proposals_addresses(epoch: Optional[int]) -> List[str]:
    epoch = epochs.get_current_epoch() if epoch is None else epoch
    return proposals.get_proposal_addresses(epoch)


def get_proposal_allocation_threshold(epoch: int) -> int:
    proposals_addresses = get_proposals_addresses(epoch)
    total_allocated = allocation_db.get_alloc_sum_by_epoch(epoch)

    return int(total_allocated / (len(proposals_addresses) * 2))


def get_proposals_with_allocations(epoch: int) -> (str, int):
    # Get *all* project allocations in the given epoch
    allocations = database.allocations.get_all_by_epoch(epoch)

    # Group the retrieved projects by the proposal address
    # and sum up the allocations for each project
    grouped_allocations = groupby(
        sorted(allocations, key=lambda a: a.proposal_address),
        key=lambda a: a.proposal_address,
    )

    allocations = [
        (
            project_address,
            sum([int(allocation.amount) for allocation in project_allocations]),
        )
        for project_address, project_allocations in grouped_allocations
    ]

    return allocations
