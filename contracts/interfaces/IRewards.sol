// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IRewards {
    function individualReward(uint32 epoch, address user) external view returns (uint256);
}
