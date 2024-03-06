import json

import pytest
from flask import current_app as app
from hexbytes import HexBytes
from multiproof import StandardMerkleTree
from multiproof.standart import LeafValue

from app.modules.common.merkle_tree import build_merkle_tree, get_proof
from app.modules.dto import AccountFundsDTO


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_merkle_tree():
    with open(
        f"{app.config['TEST_DIR']}/modules/common/merkle_tree/testInputs.json", "r"
    ) as f:
        test_inputs = json.load(f)

    leaves = [AccountFundsDTO(addr, amount) for addr, amount in test_inputs]
    merkle_tree = build_merkle_tree(leaves)

    # validate whole dumped tree
    with open(
        f"{app.config['TEST_DIR']}/modules/common/merkle_tree/expectedMerkleTree.json",
        "r",
    ) as f:
        expected_merkle_tree_json = json.load(f)

        tree = [HexBytes(val) for val in expected_merkle_tree_json["tree"]]
        values = [
            LeafValue(deserialize_leaf(value["value"]), value["treeIndex"])
            for value in expected_merkle_tree_json["values"]
        ]

        expected_merkle_tree = StandardMerkleTree(
            tree=tree,
            values=values,
            leaf_encoding=expected_merkle_tree_json["leafEncoding"],
        )

    assert merkle_tree.root == expected_merkle_tree.root
    assert merkle_tree.tree == expected_merkle_tree.tree
    assert merkle_tree.values == expected_merkle_tree.values
    assert merkle_tree.leaf_encoding == expected_merkle_tree.leaf_encoding

    # validate proofs
    with open(
        f"{app.config['TEST_DIR']}/modules/common/merkle_tree/expectedProofs.json", "r"
    ) as f:
        expected_proofs = json.load(f)
    for i, test_input in enumerate(test_inputs):
        assert get_proof(merkle_tree, test_input[0]) == expected_proofs[i]


def deserialize_leaf(leaf_values):
    return [leaf_values[0], int(leaf_values[1])]
