// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./OctantBase.sol";

import {CommonErrors, VaultErrors} from "./Errors.sol";

/**
 * @title Vault
 * @dev This contract allows for claiming the rewards from Octant.
 */
contract Vault is OctantBase {

    event Withdrawn(address user, uint256 amount);
    event MerkleRootSet(uint256 epoch, bytes32 root);

    struct WithdrawPayload {
        // @notice The epoch number
        uint256 epoch;
        // @notice The amount to withdraw
        uint256 amount;
        // @notice The Merkle proof for the rewards
        bytes32[] proof;
    }

    /// @notice epoch => merkle root of the merkle tree containing users and proposals rewards
    mapping(uint256 => bytes32) public merkleRoots;

    /// @notice user or proposal address => last epoch that rewards were claimed from
    mapping(address => uint256) public lastClaimedEpoch;

    constructor(address _auth) OctantBase(_auth) {}

    /**
     * @notice Sets the Merkle root for the given epoch.
     * @param epoch The epoch number.
     * @param root The Merkle root.
     */
    function setMerkleRoot(uint256 epoch, bytes32 root) external onlyMultisig {
        require(merkleRoots[epoch] == bytes32(0), VaultErrors.MERKLE_ROOT_ALREADY_SET);
        merkleRoots[epoch] = root;

        emit MerkleRootSet(epoch, root);
    }

    /**
     * @notice Allows a user to claim their rewards for multiple epochs.
     * Payloads must be put in epochs order and it's only possible to withdraw from epochs higher
     * than the lastClaimedEpoch.
     * @param payloads An array of WithdrawPayload structs.
     */
    function batchWithdraw(WithdrawPayload[] calldata payloads) external {
        require(payloads.length > 0, VaultErrors.EMPTY_PAYLOADS);

        uint256 amount = 0;
        uint256 claimedEpoch = lastClaimedEpoch[msg.sender];

        for (uint256 i = 0; i < payloads.length; i++) {
            require(payloads[i].epoch > claimedEpoch, VaultErrors.ALREADY_CLAIMED);
            bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, payloads[i].amount))));
            bytes32 root = merkleRoots[payloads[i].epoch];
            require(verify(payloads[i].proof, root, leaf), VaultErrors.INVALID_MERKLE_PROOF);

            claimedEpoch = payloads[i].epoch;
            amount += payloads[i].amount;
        }
        lastClaimedEpoch[msg.sender] = claimedEpoch;
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, CommonErrors.FAILED_TO_SEND);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Allows the multisig to withdraw a specified amount in case of an emergency.
     * @param amount The amount to withdraw.
     */
    function emergencyWithdraw(uint256 amount) external onlyMultisig {
        address multisig = super.getMultisig();
        payable(multisig).transfer(amount);

        emit Withdrawn(multisig, amount);
    }

    /**
     * @dev Verifies the Merkle proof for the given leaf and root.
     * @param proof The Merkle proof.
     * @param root The Merkle root.
     * @param leaf The leaf node.
     * @return A boolean value indicating whether the proof is valid.
     */
    function verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) public pure returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    receive() external payable {
        /* do not add any code here, it will get reverted because of tiny gas stipend */
    }
}
