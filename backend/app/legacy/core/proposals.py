from decimal import Decimal
from itertools import groupby
from typing import Optional, List, Tuple

from app.context.epoch_details import get_epoch_details
from app.context.epoch_state import EpochState
from app.extensions import epochs, proposals
from app.infrastructure import database
from app.infrastructure.database import allocations as allocation_db
from app.infrastructure.database.models import PendingEpochSnapshot
from app.legacy.core.common import AccountFunds


def get_proposals_addresses(epoch: Optional[int]) -> List[str]:
    epoch = epochs.get_current_epoch() if epoch is None else epoch
    return proposals.get_proposal_addresses(epoch)


def get_proposal_allocation_threshold(epoch: int) -> int:
    proposals_addresses = get_proposals_addresses(epoch)
    total_allocated = allocation_db.get_alloc_sum_by_epoch(epoch)

    return int(total_allocated / (len(proposals_addresses) * 2))


def get_finalized_rewards(
    epoch: int, snapshot: PendingEpochSnapshot
) -> Tuple[List[AccountFunds], int, int, int]:
    patrons_rewards = _get_patrons_rewards(snapshot.epoch)
    matched_rewards = _get_matched_rewards(snapshot, patrons_rewards)
    projects = get_proposals_with_allocations(epoch)
    threshold = get_proposal_allocation_threshold(epoch)

    total_allocated_above_threshold = sum(
        [allocated for _, allocated in projects if allocated > threshold]
    )

    proposal_rewards_sum = 0
    proposal_rewards: List[AccountFunds] = []

    for address, allocated in projects:
        if allocated > threshold:
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


def _get_patrons_rewards(pending_epoch: int) -> int:
    epoch_details = get_epoch_details(pending_epoch, EpochState.CURRENT)
    patrons = database.patrons.get_all_patrons_at_timestamp(
        epoch_details.finalized_timestamp.datetime()
    )
    return database.budgets.get_sum_by_users_addresses_and_epoch(patrons, pending_epoch)


def _get_matched_rewards(snapshot: PendingEpochSnapshot, patrons_rewards: int) -> int:
    return (
        int(snapshot.total_rewards)
        - int(snapshot.all_individual_rewards)
        + patrons_rewards
    )
