// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

interface IRewards {
    function individualReward(
        uint32 epoch,
        address user
    ) external view returns (uint256);

    function claimableReward(
        uint32 epoch,
        address user
    ) external view returns (uint256);

    function proposalReward(
        uint32 epoch,
        uint256 proposalId
    ) external view returns (uint256);
}
