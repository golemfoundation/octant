// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface IAllocationsStorage {
    struct Allocation {
        address proposal;
        uint256 allocation;
    }

    function getUserAllocations(
        uint256 _epoch,
        address _user
    ) external view returns (Allocation[] memory);

    function getProposalAllocation(
        uint256 _epoch,
        address _proposal
    ) external view returns (uint256);

    function addAllocation(
        uint256 _epoch,
        address _user,
        Allocation memory _allocation
    ) external;

    function putClaimableReward(
        uint256 _epoch,
        address _user,
        uint256 _amount
    ) external;

    function getTotalClaimableRewards(
        uint256 _epoch
    ) external view returns (uint256);

    function removeUserAllocations(uint256 _epoch, address _user) external;

    function getUserClaimableRewards(
        uint256 _epoch,
        address _user
    ) external view returns (uint256);
}
