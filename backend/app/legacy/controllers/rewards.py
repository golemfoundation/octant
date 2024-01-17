from dataclasses import dataclass
from decimal import Decimal
from functools import reduce
from typing import List, Tuple

from dataclass_wizard import JSONWizard

from app import exceptions
from app.context.epoch_details import get_epoch_details
from app.context.epoch_state import EpochState
from app.extensions import epochs
from app.infrastructure import database
from app.infrastructure.database.models import PendingEpochSnapshot
from app.legacy.controllers.user import get_all_users
from app.legacy.core import proposals, merkle_tree
from app.legacy.core.epochs import epoch_snapshots as core_epoch_snapshots
from app.legacy.core.proposals import get_proposals_with_allocations
from app.legacy.core.user.budget import get_budget


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


def get_estimated_proposals_rewards() -> List[ProposalReward]:
    pending_epoch = epochs.get_pending_epoch()

    if pending_epoch is None:
        raise exceptions.NotInDecisionWindow

    snapshot = database.pending_epoch_snapshot.get_by_epoch(pending_epoch)

    if not snapshot:
        raise exceptions.MissingSnapshot

    patrons_rewards = _get_patrons_rewards(pending_epoch)
    matched_rewards = _get_matched_rewards(snapshot, patrons_rewards)
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
