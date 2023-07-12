from dataclasses import dataclass
from decimal import Decimal
from functools import reduce
from typing import List
from typing import Optional

from dataclass_wizard import JSONWizard

from app import database
from app import exceptions
from app.contracts.epochs import epochs
from app.core import proposals, merkle_tree, epochs as core_epochs
from app.core.proposals import get_proposals_with_allocations
from app.core.rewards import calculate_matched_rewards, get_matched_rewards_from_epoch


@dataclass(frozen=True)
class ProposalReward(JSONWizard):
    address: str
    allocated: int
    matched: int


@dataclass(frozen=True)
class Rewards(JSONWizard):
    epoch: int
    allocated: int
    matched: Optional[int]


@dataclass(frozen=True)
class RewardsMerkleTreeLeaf(JSONWizard):
    address: str
    amount: int


@dataclass(frozen=True)
class RewardsMerkleTree(JSONWizard):
    epoch: int
    rewards_sum: int
    root: str
    leaves: List[RewardsMerkleTreeLeaf]
    leaf_encoding: List[str]


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

    allocated = database.allocations.get_alloc_sum_by_epoch(epoch)
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


def get_rewards_merkle_tree(epoch: int) -> RewardsMerkleTree:
    if not core_epochs.has_finalized_epoch_snapshot(epoch):
        raise exceptions.InvalidEpoch

    mt = merkle_tree.get_merkle_tree_for_epoch(epoch)
    leaves = [
        RewardsMerkleTreeLeaf(address=leaf.value[0], amount=leaf.value[1])
        for leaf in mt.values
    ]

    rewards_sum = reduce(lambda acc, l: acc + l.amount, leaves, 0)

    return RewardsMerkleTree(
        epoch=epoch,
        rewards_sum=rewards_sum,
        root=mt.root,
        leaves=leaves,
        leaf_encoding=merkle_tree.LEAF_ENCODING,
    )
