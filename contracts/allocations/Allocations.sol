pragma solidity ^0.8.9;

import "../interfaces/IEpochs.sol";
import "../interfaces/IAllocationsStorage.sol";
import "../interfaces/IRewards.sol";

import "../deposits/Tracker.sol";

import {AllocationErrors} from "../Errors.sol";

contract Allocations {
    /// @notice Epochs contract.
    IEpochs public immutable epochs;

    /// @notice Tracking user`s allocations.
    IAllocationsStorage public immutable allocationsStorage;

    /// @notice Tracking hexagon rewards.
    IRewards public immutable rewards;

    /// @notice emitted after user allocated funds.
    /// @param epoch for which user has allocated (current epoch - 1).
    /// @param user address of the user who allocated funds.
    /// @param proposalId id of the proposal the user has allocated funds for.
    /// @param allocatedFunds funds allocated to the proposal.
    event Allocated(uint256 indexed epoch, address indexed user, uint256 proposalId, uint256 allocatedFunds);

    constructor(
        address _epochsAddress,
        address _allocationsStorageAddress,
        address _rewardsAddress
    ) {
        epochs = IEpochs(_epochsAddress);
        allocationsStorage = IAllocationsStorage(_allocationsStorageAddress);
        rewards = IRewards(_rewardsAddress);
    }

    /// @notice Allocate funds from previous epoch on given proposal.
    function allocate(uint256 _proposalId, uint256 _fundsToAllocate) external {
        require(_proposalId != 0, AllocationErrors.PROPOSAL_ID_CANNOT_BE_ZERO);
        require(epochs.isStarted(), AllocationErrors.EPOCHS_HAS_NOT_STARTED_YET);
        require(epochs.isDecisionWindowOpen(), AllocationErrors.DECISION_WINDOW_IS_CLOSED);
        uint32 epoch = epochs.getCurrentEpoch() - 1;
        require(
            rewards.individualReward(epoch, msg.sender) >= _fundsToAllocate,
            AllocationErrors.ALLOCATE_ABOVE_REWARDS_BUDGET
        );

        IAllocationsStorage.Allocation memory _allocation = allocationsStorage.getUserAllocation(epoch, msg.sender);
        if (_allocation.proposalId != 0) {
            allocationsStorage.removeAllocation(epoch, _allocation.proposalId, msg.sender);
        }
        allocationsStorage.addAllocation(epoch, _proposalId, msg.sender, _fundsToAllocate);

        emit Allocated(epoch, msg.sender, _proposalId, _fundsToAllocate);
    }
}
