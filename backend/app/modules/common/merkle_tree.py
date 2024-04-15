from typing import List

from multiproof import StandardMerkleTree

from app.exceptions import MissingAddress
from app.infrastructure import database
from app.modules.dto import AccountFundsDTO

LEAF_ENCODING: List[str] = ["address", "uint256"]


def get_rewards_merkle_tree_for_epoch(epoch: int) -> StandardMerkleTree:
    leaves = [
        AccountFundsDTO(r.address, int(r.amount))
        for r in database.rewards.get_by_epoch(epoch)
    ]
    return build_merkle_tree(leaves)


def build_merkle_tree(
    leaves: List[AccountFundsDTO],
) -> StandardMerkleTree:
    return StandardMerkleTree.of(
        [[leaf.address, leaf.amount] for leaf in leaves], LEAF_ENCODING
    )


def get_proof(mt: StandardMerkleTree, address: str) -> List[str]:
    for i, leaf in enumerate(mt.values):
        if leaf.value[0] == address:
            return mt.get_proof(i)
    raise MissingAddress(address)
