from decimal import Decimal
from itertools import groupby
from typing import Optional, List

from app import database
from app.core.common import AccountFunds
from app.core.rewards.rewards import (
    get_matched_rewards_from_epoch,
    calculate_matched_rewards_threshold,
)
from app.database import allocations as allocation_db
from app.extensions import epochs, proposals


def get_number_of_proposals(epoch: Optional[int]) -> int:
    epoch = epochs.get_current_epoch() if epoch is None else epoch
    return len(proposals.get_proposal_addresses(epoch))


def get_proposal_allocation_threshold(epoch: int) -> int:
    proposals_count = get_number_of_proposals(epoch)
    total_allocated = allocation_db.get_alloc_sum_by_epoch(epoch)

    return calculate_matched_rewards_threshold(total_allocated, proposals_count)


def get_proposal_rewards_above_threshold(
    epoch: int,
) -> (List[AccountFunds], int):
    matched_rewards = get_matched_rewards_from_epoch(epoch)
    projects = get_proposals_with_allocations(epoch)
    threshold = get_proposal_allocation_threshold(epoch)

    total_allocated_above_threshold = sum(
        [allocated for _, allocated in projects if allocated >= threshold]
    )

    rewards_sum = 0
    rewards = []

    for address, allocated in projects:
        if allocated >= threshold:
            matched = int(
                Decimal(allocated)
                / Decimal(total_allocated_above_threshold)
                * matched_rewards
            )
            rewards_sum += allocated + matched
            rewards.append(AccountFunds(address, allocated + matched))

    return rewards, rewards_sum


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
