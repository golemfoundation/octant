from typing import List

from multiproof import StandardMerkleTree

from app import database
from app.core.common import AddressAndAmount
from app.exceptions import MissingAddress


def get_proof_by_address_and_epoch(address: str, epoch: int) -> List[str]:
    leaves = [
        AddressAndAmount(r.address, int(r.amount))
        for r in database.rewards.get_by_epoch(epoch)
    ]
    merkle_tree = build_merkle_tree(leaves)
    return get_proof(merkle_tree, address)


def build_merkle_tree(leaves: List[AddressAndAmount]) -> StandardMerkleTree:
    return StandardMerkleTree.of(
        [[leaf.address, leaf.amount] for leaf in leaves], ["address", "uint256"]
    )


def get_proof(mt: StandardMerkleTree, address: str) -> List[str]:
    for i, leaf in enumerate(mt.values):
        if leaf.value[0] == address:
            return mt.get_proof(i)
    raise MissingAddress(address)
