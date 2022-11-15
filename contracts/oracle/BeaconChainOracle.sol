pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Implementation of Beacon chain oracle
 *
 * @notice The goal of the oracle is to provide balance of the Golem Foundation validator's account on the ETH 2.0 side.
 * Balance for epoch will be taken from block which corresponds to end of Hexagon epoch (check `Epochs.sol` contract).
 */
contract BeaconChainOracle is Ownable {

    /// @notice balance from beacon chain in given epoch
    mapping(uint256 => uint256) public balanceByEpoch;

    constructor() {
    }

    function setBalance(uint256 epoch, uint256 balance) external onlyOwner {
        require(balanceByEpoch[epoch] == 0, "HN/balance-for-given-epoch-already-exists");
        balanceByEpoch[epoch] = balance;
    }
}
