// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

interface IAllocationsStorage {
    struct Allocation {
        uint256 allocation;
        uint256 proposalId;
    }

    function getUserAllocation(uint256 _epoch, address _user) external view returns (Allocation memory);

    function addAllocation(uint256 _epoch, uint256 _proposalId, address _user, uint256 _fundsToAllocate) external;

    function removeAllocation(uint256 _epoch, uint256 _proposalId, address _user) external;

    function getUsersWithTheirAllocations(
        uint256 _epoch,
        uint256 _proposalId
    ) external view returns (address[] memory, uint256[] memory);

    function getAllocationsCount(uint256 _epoch, uint256 _proposalId) external view returns (uint256);

    function getUser(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index
    ) external view returns (address);
}
