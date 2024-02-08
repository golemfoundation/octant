from dataclasses import dataclass
from decimal import Decimal
from functools import reduce
from typing import List, Tuple, Optional

from dataclass_wizard import JSONWizard

from app.core.epochs import epoch_snapshots as core_epoch_snapshots
from app import database
from app import exceptions
from app.core import proposals, merkle_tree
from app.core.user.budget import get_budget
from app.core.epochs.epoch_snapshots import has_pending_epoch_snapshot
from app.core.proposals import get_proposals_with_allocations
from app.core.rewards.rewards import (
    get_estimated_matched_rewards,
)
from app.extensions import epochs
from app.controllers.user import get_all_users


@dataclass()
class ProposalReward(JSONWizard):
    address: str
    allocated: int
    matched: int


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


def get_allocation_threshold(epoch: int = None) -> int:
    epoch = epochs.get_pending_epoch() if epoch is None else epoch

    if epoch is None:
        raise exceptions.NotInDecisionWindow

    return proposals.get_proposal_allocation_threshold(epoch)


def get_estimated_proposals_rewards() -> Optional[List[ProposalReward]]:
    pending_epoch = epochs.get_pending_epoch()

    if pending_epoch is None:
        raise exceptions.NotInDecisionWindow

    if not has_pending_epoch_snapshot(pending_epoch):
        raise exceptions.MissingSnapshot

    matched_rewards = get_estimated_matched_rewards()
    proposals_with_allocations = get_proposals_with_allocations(pending_epoch)
    threshold = get_allocation_threshold(pending_epoch)

    total_allocated_above_threshold = sum(
        [
            allocated
            for _, allocated in proposals_with_allocations
            if allocated > threshold
        ]
    )

    rewards = {
        address: ProposalReward(address, 0, 0)
        for address in proposals.get_proposals_addresses(pending_epoch)
    }

    for address, allocated in proposals_with_allocations:
        if allocated > threshold:
            matched = int(
                Decimal(allocated)
                / Decimal(total_allocated_above_threshold)
                * matched_rewards
            )
        else:
            matched = 0

        proposal_rewards = rewards[address]
        proposal_rewards.allocated = allocated
        proposal_rewards.matched = matched

    return list(rewards.values())


def get_finalized_epoch_proposals_rewards(epoch: int = None) -> List[ProposalReward]:
    last_finalized_epoch = core_epoch_snapshots.get_last_finalized_snapshot()
    if epoch > last_finalized_epoch:
        raise exceptions.MissingSnapshot()

    proposals_address_list = proposals.get_proposals_addresses(epoch)
    raw_proposals_rewards = database.rewards.get_by_epoch_and_address_list(
        epoch, proposals_address_list
    )

    return [
        ProposalReward(
            reward.address,
            int(reward.amount) - int(reward.matched),
            int(reward.matched),
        )
        for reward in raw_proposals_rewards
    ]


def get_rewards_merkle_tree(epoch: int) -> RewardsMerkleTree:
    if not core_epoch_snapshots.has_finalized_epoch_snapshot(epoch):
        raise exceptions.InvalidEpoch

    mt = merkle_tree.get_merkle_tree_for_epoch(epoch)
    leaves = [
        RewardsMerkleTreeLeaf(address=leaf.value[0], amount=leaf.value[1])
        for leaf in mt.values
    ]

    rewards_sum = reduce(lambda acc, leaf: acc + leaf.amount, leaves, 0)

    return RewardsMerkleTree(
        epoch=epoch,
        rewards_sum=rewards_sum,
        root=mt.root,
        leaves=leaves,
        leaf_encoding=merkle_tree.LEAF_ENCODING,
    )


def get_all_budgets(epoch: int) -> List[Tuple[str, int]]:
    all_users = get_all_users()
    budgets = []
    for user in sorted(all_users):
        budget = get_budget(user, epoch)
        budgets += [{"user": user, "budget": budget}]

    return budgets
