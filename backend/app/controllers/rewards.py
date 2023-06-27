from dataclasses import dataclass
from decimal import Decimal
from typing import List
from typing import Optional

from app import database
from app import exceptions
from app.contracts.epochs import epochs
from app.core import proposals
from app.core.proposals import get_proposals_with_allocations
from app.core.rewards import calculate_matched_rewards, get_matched_rewards_from_epoch


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


def get_rewards_budget(epoch: int = None) -> Rewards:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    matched = None

    try:
        snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)
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
    return proposals.get_proposal_allocation_threshold(epoch)


def get_proposals_rewards(epoch: int = None) -> List[ProposalReward]:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch
    matched_rewards = get_matched_rewards_from_epoch(epoch)
    projects = get_proposals_with_allocations(epoch)
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
