from decimal import Decimal
from itertools import groupby
from typing import Optional, List, Tuple

from app.extensions import epochs, proposals
from app.infrastructure import database
from app.infrastructure.database import allocations as allocation_db
from app.infrastructure.database.models import PendingEpochSnapshot
from app.legacy.core.common import AccountFunds
from app.legacy.core.rewards.rewards import (
    calculate_matched_rewards_threshold,
    calculate_matched_rewards,
)
from app.legacy.core.user.budget import get_patrons_budget


def get_proposals_addresses(epoch: Optional[int]) -> List[str]:
    epoch = epochs.get_current_epoch() if epoch is None else epoch
    return proposals.get_proposal_addresses(epoch)


def get_proposal_allocation_threshold(epoch: int) -> int:
    proposals_addresses = get_proposals_addresses(epoch)
    total_allocated = allocation_db.get_alloc_sum_by_epoch(epoch)

    return calculate_matched_rewards_threshold(
        total_allocated, len(proposals_addresses)
    )


def get_finalized_rewards(
    epoch: int, pending_snapshot: PendingEpochSnapshot
) -> Tuple[List[AccountFunds], int, int, int]:
    patrons_rewards = get_patrons_budget(pending_snapshot)
    matched_rewards = calculate_matched_rewards(pending_snapshot, patrons_rewards)
    projects = get_proposals_with_allocations(epoch)
    threshold = get_proposal_allocation_threshold(epoch)

    total_allocated_above_threshold = sum(
        [allocated for _, allocated in projects if allocated >= threshold]
    )

    proposal_rewards_sum = 0
    proposal_rewards: List[AccountFunds] = []

    for address, allocated in projects:
        if allocated >= threshold:
            matched = int(
                Decimal(allocated)
                / Decimal(total_allocated_above_threshold)
                * matched_rewards
            )
            proposal_rewards_sum += allocated + matched
            proposal_rewards.append(AccountFunds(address, allocated + matched, matched))

    return proposal_rewards, proposal_rewards_sum, matched_rewards, patrons_rewards


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
