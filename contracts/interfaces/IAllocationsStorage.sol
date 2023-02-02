// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface IAllocationsStorage {
    struct Allocation {
        uint256 proposalId;
        uint256 allocation;
    }

    function getUserAllocations(
        uint256 _epoch,
        address _user
    ) external view returns (Allocation[] memory);

    function addAllocation(
        uint256 _epoch,
        address _user,
        Allocation memory _allocation
    ) external;

    function removeUserAllocations(uint256 _epoch, address _user) external;

    function getUsersWithTheirAllocations(
        uint256 _epoch,
        uint256 _proposalId
    ) external view returns (address[] memory, uint256[] memory);
}
