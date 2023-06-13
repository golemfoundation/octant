from typing import List

from multiproof import StandardMerkleTree


class Leaf:
    def __init__(self, address: str, amount: int):
        self.address = address
        self.amount = amount


def build_merkle_tree(leaves: List[Leaf]) -> StandardMerkleTree:
    return StandardMerkleTree.of(
        [[leaf.address, leaf.amount] for leaf in leaves], ["address", "uint256"]
    )


def get_proof(mt: StandardMerkleTree, address: str) -> List[str]:
    for i, leaf in enumerate(mt.values):
        if leaf.value[0] == address:
            return mt.get_proof(i)
    raise Exception("Address not found")
