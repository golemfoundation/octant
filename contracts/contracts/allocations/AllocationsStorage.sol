// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "../interfaces/IAllocationsStorage.sol";

import {CommonErrors} from "../Errors.sol";
import "../OctantBase.sol";

contract AllocationsStorage is OctantBase, IAllocationsStorage {
    mapping(bytes32 => Allocation[]) private allocationsByUser;
    mapping(bytes32 => uint256) private allocationByProposal;
    mapping(bytes32 => uint256) private claimableRewardsByUser;
    mapping(uint256 => uint256) private claimableRewardsTotal;

    /// @notice Allocations contract address.
    address public allocationsAddress;

    constructor(address _auth) OctantBase(_auth) {
    }

    // @notice Get user's allocations in given epoch.
    function getUserAllocations(
        uint256 _epoch,
        address _user
    ) external view returns (Allocation[] memory) {
        return _getAllocationsByUser(_epoch, _user);
    }

    // @notice Get proposal's total allocation in given epoch.
    function getProposalAllocation(
        uint256 _epoch,
        address _proposal
    ) external view returns (uint256) {
        return _getAllocationByProposal(_epoch, _proposal);
    }

    // @notice Add an allocation. Requires that the allocation does not exist.
    function addAllocation(
        uint256 _epoch,
        address _user,
        Allocation memory _allocation
    ) external onlyAllocations {
        uint256 _oldProposalAllocation = _getAllocationByProposal(_epoch, _allocation.proposal);
        _setAllocationByProposal(_epoch, _allocation.proposal, _oldProposalAllocation + _allocation.allocation);
        _addAllocationByUser(_epoch, _user, _allocation);
    }

    // @notice Put user's claimable rewards. If it's already existed, the amount is replaced.
    function putClaimableReward(
        uint256 _epoch,
        address _user,
        uint256 _amount
    ) external onlyAllocations {
        uint256 _oldAmount = _getClaimableRewardsByUser(_epoch, _user);
        _setClaimableRewardsByUser(_epoch, _user, _amount);
        _setClaimableRewardsTotal(_epoch, _oldAmount, _amount);
    }

    // @notice Get user's claimable rewards.
    function getUserClaimableRewards(
        uint256 _epoch,
        address _user
    ) external view returns (uint256) {
        return _getClaimableRewardsByUser(_epoch, _user);
    }

    // @notice Get total claimable rewards.
    function getTotalClaimableRewards(
        uint256 _epoch
    ) external view returns (uint256) {
        return claimableRewardsTotal[_epoch];
    }

    /// @notice Remove user's allocations in given epoch. If allocations for the epoch already existed, they will be replaced.
    function removeUserAllocations(
        uint256 _epoch,
        address _user
    ) external onlyAllocations {
        Allocation[] memory _allocations = _getAllocationsByUser(_epoch, _user);
        for (uint256 i = 0; i < _allocations.length; i++) {
            uint256 _oldProposalAllocation = _getAllocationByProposal(_epoch, _allocations[i].proposal);
            _setAllocationByProposal(_epoch, _allocations[i].proposal, _oldProposalAllocation - _allocations[i].allocation);
        }
        _deleteAllocationsByUser(_epoch, _user);
    }

    function setAllocations(address _allocationsAddress) external onlyDeployer {
        require(address(allocationsAddress) == address(0x0), "Allocations address already set");
        allocationsAddress = _allocationsAddress;
    }

    // @notice Get allocations by user.
    function _getAllocationsByUser(
        uint256 _epoch,
        address _user
    ) private view returns (Allocation[] storage) {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".user", _user));
        return allocationsByUser[key];
    }

    // @notice Add allocation by user.
    function _addAllocationByUser(
        uint256 _epoch,
        address _user,
        Allocation memory _allocation
    ) private {
        Allocation[] storage _userAllocations = _getAllocationsByUser(
            _epoch,
            _user
        );
        _userAllocations.push(_allocation);
    }

    // @notice Delete allocations by user.
    function _deleteAllocationsByUser(uint256 _epoch, address _user) private {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".user", _user));
        delete allocationsByUser[key];
    }

    // @notice Get allocation by proposal.
    function _getAllocationByProposal(
        uint256 _epoch,
        address _proposal
    ) private view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".proposal", _proposal));
        return allocationByProposal[key];
    }

    // @notice Set allocation by proposal.
    function _setAllocationByProposal(
        uint256 _epoch,
        address _proposal,
        uint256 _allocation
    ) private {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".proposal", _proposal));
        allocationByProposal[key] = _allocation;
    }

    function _setClaimableRewardsByUser(
        uint256 _epoch,
        address _user,
        uint256 _amount
    ) private {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".epoch", _epoch, ".user", _user)
        );
        claimableRewardsByUser[key] = _amount;
    }

    function _getClaimableRewardsByUser(
        uint256 _epoch,
        address _user
    ) private view returns (uint256) {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".epoch", _epoch, ".user", _user)
        );
        return claimableRewardsByUser[key];
    }

    function _setClaimableRewardsTotal(
        uint256 _epoch,
        uint256 _oldAmount,
        uint256 _newAmount
    ) private {
        uint256 newTotal = claimableRewardsTotal[_epoch] - _oldAmount + _newAmount;
        claimableRewardsTotal[_epoch] = newTotal;
    }

    modifier onlyAllocations() {
        require(
            msg.sender == allocationsAddress,
            CommonErrors.UNAUTHORIZED_CALLER
        );
        _;
    }
}
