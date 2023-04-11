// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "../interfaces/ITracker.sol";
import "../interfaces/IDeposits.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {DepositsErrors} from "../Errors.sol";
import "../OctantBase.sol";

/// @title Contract tracking GLM deposits for Octant project.
/// @author Golem Foundation
/// @notice GLM can be locked or unlocked at any moment by its owner.
/// To be more capital effective, do lock at the end of an epoch,
/// and unlock at the beginning of an epoch.
/// @dev Please note that complexity of this contract should be kept as low as possible,
/// even at the cost of increased complexity of other contracts. Lets strive to limit
/// risk exposure of GLM deposits. This is why effective deposit tracking is outside
/// in a contract that can fail without affecting unlock calls.
contract Deposits is OctantBase, IDeposits {
    /// @notice GLM token contract address
    ERC20 public immutable glm;

    /// @notice Effective Deposits tracker contract address
    ITracker public tracker;

    event Locked(uint224 amount, uint256 when, address user);
    event Unlocked(uint224 amount, uint256 when, address user);
    event TrackerUpdated();
    event TrackerFailed(bytes reason);

    /// @dev deposit amounts per user
    mapping(address => uint256) public deposits;

    /// @param glmAddress Address of Golem Network Token contract (updated, GLM).
    constructor(address glmAddress, address _auth) OctantBase(_auth) {
        glm = ERC20(glmAddress);
    }

    /// @notice Lock GLM to enable participation in Octant experiment.
    /// This can be done at any time, but it is most capital effective at the end of the epoch.
    /// @param amount Amount of GLM to be locked.
    function lock(uint224 amount) external {
        uint224 oldDeposit = uint224(deposits[msg.sender]);
        deposits[msg.sender] = oldDeposit + amount;
        require(
            glm.transferFrom(msg.sender, address(this), amount),
            DepositsErrors.GLM_TRANSFER_FAILED
        );
        emit Locked(amount, block.timestamp, msg.sender);

        tracker.processLock(msg.sender, oldDeposit, amount);
    }

    /// @notice Unlock GLM. This can be done at any time, but it is most capital effective at the beginning of the epoch.
    /// @param amount Amount of GLM to be unlocked.
    function unlock(uint224 amount) external {
        uint224 oldDeposit = uint224(deposits[msg.sender]);
        require(oldDeposit >= amount, DepositsErrors.DEPOSIT_IS_TO_SMALL);
        deposits[msg.sender] = oldDeposit - amount;
        require(glm.transfer(msg.sender, amount));
        emit Unlocked(amount, block.timestamp, msg.sender);

        (bool result, bytes memory error) = tracker.processUnlock(
            msg.sender,
            oldDeposit,
            amount
        );
        if (result) {
            emit TrackerUpdated();
        } else {
            emit TrackerFailed(error);
        }
    }

    function setTrackerAddress(address newTracker) external onlyDeployer {
        require(address(tracker) == address(0x0));
        tracker = ITracker(newTracker);
    }
}
