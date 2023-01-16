// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAllocationsStorage.sol";

import {AllocationStorageErrors} from "../Errors.sol";

contract AllocationsStorage is Ownable, IAllocationsStorage {
    mapping(bytes32 => Allocation) private allocationsByUser;
    mapping(bytes32 => address) private allocationsByProposal;
    mapping(bytes32 => uint256) private allocationsCount;
    mapping(bytes32 => uint256) private allocationIndex;

    // @notice Get user's allocation in given epoch.
    function getUserAllocation(uint256 _epoch, address _user) external view returns (Allocation memory) {
        return _getAllocationByUser(_epoch, _user);
    }

    // @notice Add an allocation. Requires that the allocation does not exist.
    function addAllocation(
        uint256 _epoch,
        uint256 _proposalId,
        address _user,
        uint256 _fundsToAllocate
    ) external onlyOwner {
        require(
            _getAllocationIndex(_epoch, _proposalId, _user) == 0,
            AllocationStorageErrors.ALLOCATION_ALREADY_EXISTS
        );
        uint256 count = _getAllocationsCount(_epoch, _proposalId);
        _setAllocationByProposal(_epoch, _proposalId, count + 1, _user);
        _setAllocationIndex(_epoch, _proposalId, _user, count + 1);
        _setAllocationsCount(_epoch, _proposalId, count + 1);
        _setAllocationByUser(_epoch, _user, _proposalId, _fundsToAllocate);
    }

    // @notice Remove an allocation. Swaps the item with the last item in the set and truncates it; computationally cheap.
    // Requires that the allocation exists.
    function removeAllocation(uint256 _epoch, uint256 _proposalId, address _user) external onlyOwner {
        uint256 index = _getAllocationIndex(_epoch, _proposalId, _user);
        require(index > 0, AllocationStorageErrors.ALLOCATION_DOES_NOT_EXIST);
        uint256 count = _getAllocationsCount(_epoch, _proposalId);
        if (index < count) {
            address lastAllocation = _getAllocationByProposal(_epoch, _proposalId, count);
            _setAllocationByProposal(_epoch, _proposalId, index, lastAllocation);
            _setAllocationIndex(_epoch, _proposalId, lastAllocation, index);
        }
        _setAllocationIndex(_epoch, _proposalId, _user, 0);
        _setAllocationsCount(_epoch, _proposalId, count - 1);
        _setAllocationByUser(_epoch, _user, 0, 0);
    }

    /// @notice Users with their allocations in WEI. Returns two arrays where every element corresponds
    /// to the same element from second array.
    /// example: array1[0] is the address which allocated array2[0] funds to some proposal.
    /// @return 0: array of user addresses
    /// 1: array of user allocation in WEI
    function getUsersWithTheirAllocations(
        uint256 _epoch,
        uint256 _proposalId
    ) external view returns (address[] memory, uint256[] memory) {
        uint256 count = _getAllocationsCount(_epoch, _proposalId);
        address[] memory users = new address[](count);
        uint256[] memory allocations = new uint256[](count);
        for (uint256 i = 1; i <= count; i++) {
            address user = getUser(_epoch, _proposalId, i);
            users[i - 1] = user;
            allocations[i - 1] = _getAllocationByUser(_epoch, user).allocation;
        }
        return (users, allocations);
    }

    // @notice The number of allocations for proposal.
    function getAllocationsCount(uint256 _epoch, uint256 _proposalId) external view returns (uint256) {
        return _getAllocationsCount(_epoch, _proposalId);
    }

    // @notice The user address by index. Iteration starts from 1.
    function getUser(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index
    ) public view returns (address) {
        return _getAllocationByProposal(_epoch, _proposalId, _index);
    }

    // @notice Get allocation by proposal.
    function _getAllocationByProposal(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index
    ) private view returns (address) {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".index", _index)
        );
        return allocationsByProposal[key];
    }

    // @notice Set allocation by proposal.
    function _setAllocationByProposal(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index,
        address _user
    ) private {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".index", _index)
        );
        allocationsByProposal[key] = _user;
    }

    // @notice Get allocation by user.
    function _getAllocationByUser(uint256 _epoch, address _user) private view returns (Allocation memory) {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".user", _user));
        return allocationsByUser[key];
    }

    // @notice Set allocation by user.
    function _setAllocationByUser(
        uint256 _epoch,
        address _user,
        uint256 _proposalId,
        uint256 _fundsToAllocate
    ) private {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".user", _user));
        allocationsByUser[key] = Allocation(_fundsToAllocate, _proposalId);
    }

    // @notice Get allocations count.
    function _getAllocationsCount(uint256 _epoch, uint256 _proposalId) private view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".proposalId", _proposalId));
        return allocationsCount[key];
    }

    // @notice Set allocations count.
    function _setAllocationsCount(uint256 _epoch, uint256 _proposalId, uint256 _count) private {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".proposalId", _proposalId));
        allocationsCount[key] = _count;
    }

    // @notice Get allocation index.
    function _getAllocationIndex(
        uint256 _epoch,
        uint256 _proposalId,
        address _user
    ) private view returns (uint256) {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".user", _user)
        );
        return allocationIndex[key];
    }

    // @notice Set allocation index.
    function _setAllocationIndex(
        uint256 _epoch,
        uint256 _proposalId,
        address _user,
        uint256 _index
    ) private {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".user", _user)
        );
        allocationIndex[key] = _index;
    }
}
