// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAllocationsStorage.sol";

import {AllocationStorageErrors} from "../Errors.sol";

contract AllocationsStorage is Ownable, IAllocationsStorage {
    mapping(bytes32 => Allocation[]) private allocationsByUser;
    mapping(bytes32 => address) private usersByProposal;
    mapping(bytes32 => uint256) private usersByProposalCount;
    mapping(bytes32 => uint256) private userByProposalIndex;

    // @notice Get user's allocations in given epoch.
    function getUserAllocations(
        uint256 _epoch,
        address _user
    ) external view returns (Allocation[] memory) {
        return _getAllocationsByUser(_epoch, _user);
    }

    // @notice Add an allocation. Requires that the allocation does not exist.
    function addAllocation(
        uint256 _epoch,
        address _user,
        Allocation memory _allocation
    ) external onlyOwner {
        require(
            _getUserByProposalIndex(_epoch, _allocation.proposalId, _user) == 0,
            AllocationStorageErrors.ALLOCATION_ALREADY_EXISTS
        );
        uint256 count = _getUsersByProposalCount(
            _epoch,
            _allocation.proposalId
        );
        _setUserByProposal(_epoch, _allocation.proposalId, count + 1, _user);
        _setUserByProposalIndex(
            _epoch,
            _allocation.proposalId,
            _user,
            count + 1
        );
        _setUsersByProposalCount(_epoch, _allocation.proposalId, count + 1);
        Allocation[] storage _userAllocations = _getAllocationsByUser(
            _epoch,
            _user
        );
        _userAllocations.push(_allocation);
    }

    /// @notice Remove user's allocations in given epoch. If allocations for the epoch already existed, they will be replaced.
    function removeUserAllocations(
        uint256 _epoch,
        address _user
    ) external onlyOwner {
        Allocation[] memory _allocations = _getAllocationsByUser(_epoch, _user);
        for (uint256 i = 0; i < _allocations.length; i++) {
            _removeUserByProposal(_epoch, _allocations[i].proposalId, _user);
        }
        _deleteAllocationsByUser(_epoch, _user);
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
        uint256 count = _getUsersByProposalCount(_epoch, _proposalId);
        address[] memory users = new address[](count);
        uint256[] memory allocations = new uint256[](count);
        for (uint256 i = 1; i <= count; i++) {
            address user = _getUserByProposal(_epoch, _proposalId, i);
            users[i - 1] = user;

            Allocation[] memory _userAllocations = _getAllocationsByUser(
                _epoch,
                user
            );
            for (uint256 j = 0; j < _userAllocations.length; j++) {
                if (_userAllocations[j].proposalId == _proposalId) {
                    allocations[i - 1] = _userAllocations[j].allocation;
                }
            }
        }
        return (users, allocations);
    }

    // @notice Get allocations by user.
    function _getAllocationsByUser(
        uint256 _epoch,
        address _user
    ) private view returns (Allocation[] storage) {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".user", _user));
        return allocationsByUser[key];
    }

    // @notice Delete allocations by user.
    function _deleteAllocationsByUser(uint256 _epoch, address _user) private {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".user", _user));
        delete allocationsByUser[key];
    }

    // @dev Remove a user who allocated for proposal. Swaps the item with the last item in the set and truncates it; computationally cheap.
    // Requires that the allocation exists.
    function _removeUserByProposal(
        uint256 _epoch,
        uint256 _proposalId,
        address _user
    ) private {
        uint256 index = _getUserByProposalIndex(_epoch, _proposalId, _user);
        require(index > 0, AllocationStorageErrors.ALLOCATION_DOES_NOT_EXIST);
        uint256 count = _getUsersByProposalCount(_epoch, _proposalId);
        if (index < count) {
            address lastAllocation = _getUserByProposal(
                _epoch,
                _proposalId,
                count
            );
            _setUserByProposal(_epoch, _proposalId, index, lastAllocation);
            _setUserByProposalIndex(_epoch, _proposalId, lastAllocation, index);
        }
        _setUserByProposalIndex(_epoch, _proposalId, _user, 0);
        _setUsersByProposalCount(_epoch, _proposalId, count - 1);
    }

    function _getUserByProposal(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index
    ) private view returns (address) {
        bytes32 key = keccak256(
            abi.encodePacked(
                _epoch,
                ".proposalId",
                _proposalId,
                ".index",
                _index
            )
        );
        return usersByProposal[key];
    }

    function _setUserByProposal(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index,
        address _user
    ) private {
        bytes32 key = keccak256(
            abi.encodePacked(
                _epoch,
                ".proposalId",
                _proposalId,
                ".index",
                _index
            )
        );
        usersByProposal[key] = _user;
    }

    function _getUsersByProposalCount(
        uint256 _epoch,
        uint256 _proposalId
    ) private view returns (uint256) {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId)
        );
        return usersByProposalCount[key];
    }

    function _setUsersByProposalCount(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _count
    ) private {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId)
        );
        usersByProposalCount[key] = _count;
    }

    function _getUserByProposalIndex(
        uint256 _epoch,
        uint256 _proposalId,
        address _user
    ) private view returns (uint256) {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".user", _user)
        );
        return userByProposalIndex[key];
    }

    function _setUserByProposalIndex(
        uint256 _epoch,
        uint256 _proposalId,
        address _user,
        uint256 _index
    ) private {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".user", _user)
        );
        userByProposalIndex[key] = _index;
    }
}
