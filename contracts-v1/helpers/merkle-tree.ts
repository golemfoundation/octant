import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { BigNumber } from 'ethers';

export default interface Leaf {
  address: string;
  amount: BigNumber;
}

export function buildMerkleTree(leaves: Leaf[]): StandardMerkleTree<string[]> {
  const leavesArray = leaves.map(leaf => [leaf.address, leaf.amount.toString()]);
  return StandardMerkleTree.of(leavesArray, ['address', 'uint256']);
}

export function getProof(tree: StandardMerkleTree<string[]>, address: string): string[] {
  for (const [i, v] of tree.entries()) {
    if (v[0] === address) {
      return tree.getProof(i);
    }
  }
  throw Error('Address not found');
}
