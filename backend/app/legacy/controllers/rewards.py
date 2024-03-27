from dataclasses import dataclass
from functools import reduce
from typing import List

from dataclass_wizard import JSONWizard

from app import exceptions
from app.infrastructure import database
from app.legacy.core import proposals
from app.legacy.core.epochs import epoch_snapshots as core_epoch_snapshots
from app.modules.common import merkle_tree


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

    mt = merkle_tree.get_rewards_merkle_tree_for_epoch(epoch)
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
