// SPDX-License-Identifier: GPL-3.0-only

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
    /// @param allocation proposalId and funds allocated for it.
    event Allocated(
        uint256 epoch,
        address user,
        IAllocationsStorage.Allocation allocation
    );

    constructor(
        address _epochsAddress,
        address _allocationsStorageAddress,
        address _rewardsAddress
    ) {
        epochs = IEpochs(_epochsAddress);
        allocationsStorage = IAllocationsStorage(_allocationsStorageAddress);
        rewards = IRewards(_rewardsAddress);
    }

    /// @notice Allocate funds from previous epoch on given proposals.
    function allocate(
        IAllocationsStorage.Allocation[] memory _allocations
    ) external {
        require(
            epochs.isStarted(),
            AllocationErrors.EPOCHS_HAS_NOT_STARTED_YET
        );
        require(
            epochs.isDecisionWindowOpen(),
            AllocationErrors.DECISION_WINDOW_IS_CLOSED
        );
        uint32 _epoch = epochs.getCurrentEpoch() - 1;

        allocationsStorage.removeUserAllocations(_epoch, msg.sender);

        uint256 _fundsToAllocate;
        for (uint256 i = 0; i < _allocations.length; i++) {
            require(
                _allocations[i].proposalId != 0,
                AllocationErrors.PROPOSAL_ID_CANNOT_BE_ZERO
            );
            allocationsStorage.addAllocation(
                _epoch,
                msg.sender,
                _allocations[i]
            );
            _fundsToAllocate += _allocations[i].allocation;

            emit Allocated(_epoch, msg.sender, _allocations[i]);
        }
        require(
            rewards.individualReward(_epoch, msg.sender) >= _fundsToAllocate,
            AllocationErrors.ALLOCATE_ABOVE_REWARDS_BUDGET
        );
    }
}
