from dataclasses import dataclass
from decimal import Decimal
from itertools import groupby
from typing import List
from typing import Optional

from app import database
from app import exceptions
from app.contracts.epochs import epochs
from app.core import allocations as allocations_core, proposals
from app.core.rewards import calculate_matched_rewards, get_matched_rewards_from_epoch
from app.database import allocations as allocation_db


@dataclass(frozen=True)
class ProposalReward:
    address: str
    allocated: int
    matched: int


@dataclass(frozen=True)
class Rewards:
    epoch: int
    allocated: int
    matched: Optional[int]


def get_user_budget(user_address: str, epoch: int) -> int:
    snapshot = database.epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None:
        return 0

    individual_share = Decimal(deposit.effective_deposit) / Decimal(
        snapshot.total_effective_deposit
    )

    return int(Decimal(snapshot.all_individual_rewards) * individual_share)


def get_rewards_budget(epoch: int = None) -> Rewards:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    matched = None

    try:
        snapshot = database.epoch_snapshot.get_by_epoch_num(epoch)
        matched = calculate_matched_rewards(snapshot)
    except exceptions.InvalidEpoch:
        # This means the epoch is still ongoing (or hasn't yet started)
        # thus the matched rewards value is not yet known.
        pass

    allocations = database.allocations.get_all_by_epoch(epoch)
    allocated = sum([int(allocation.amount) for allocation in allocations])

    return Rewards(epoch, allocated, matched)


def get_allocation_threshold(epoch: int = None) -> int:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch

    proposals_no = proposals.get_number_of_proposals(epoch)
    total_allocated = sum(
        [int(a.amount) for a in allocation_db.get_all_by_epoch(epoch)]
    )

    return allocations_core.calculate_threshold(total_allocated, proposals_no)


def get_proposals_rewards(epoch: int = None) -> List[ProposalReward]:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    matched_rewards = get_matched_rewards_from_epoch(epoch)

    projects = _get_proposals_with_allocations(epoch)
    threshold = get_allocation_threshold(epoch)

    total_allocated_above_threshold = sum(
        [allocated for _, allocated in projects if allocated >= threshold]
    )

    rewards = []

    for address, allocated in projects:
        if allocated >= threshold:
            matched = int(
                Decimal(allocated)
                / Decimal(total_allocated_above_threshold)
                * matched_rewards
            )
        else:
            matched = 0

        rewards.append(ProposalReward(address, allocated, matched))

    return rewards


def _get_proposals_with_allocations(epoch: int) -> (str, int):
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
