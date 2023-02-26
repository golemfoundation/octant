// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "../interfaces/ITracker.sol";
import "./Tracker.sol";

import {TrackerErrors, CommonErrors} from "../Errors.sol";

/// @title Wrapper to contract tracking effective deposits across epochs (Octant).
/// @author Golem Foundation
/// @notice This contract is a wrapper to Tracker. Purpose of it is to catch errors from Tracker and
/// convert it to boolean value.
contract TrackerWrapper is ITracker {
    /// @notice Tracker contract address.
    Tracker public immutable tracker;

    /// @notice Deposits contract address.
    address public depositsAddress;

    constructor(address _trackerAddress, address _depositsAddress) {
        tracker = Tracker(_trackerAddress);
        depositsAddress = _depositsAddress;
    }

    /// @dev Handle GLM locking, compute epoch effective deposit.
    /// @param owner Owner of GLM
    /// @param oldDeposit Last value of owner's GLM deposit
    /// @param amount New funds being locked.
    function processLock(
        address owner,
        uint224 oldDeposit,
        uint224 amount
    ) external onlyDeposits {
        tracker.processLock(owner, oldDeposit, amount);
    }

    /// @dev Handle GLM unlocking, compute epoch effective deposit.
    /// @param owner Owner of GLM
    /// @param oldDeposit Last value of owner's GLM deposit
    /// @param amount Amount of funds being unlocked.
    /// @return true if computation was successful, false in case of any error
    function processUnlock(
        address owner,
        uint224 oldDeposit,
        uint224 amount
    ) external onlyDeposits returns (bool, bytes memory) {
        try tracker.processUnlock(owner, oldDeposit, amount) {
            return (true, "");
        } catch Error(string memory reason) {
            // This is executed in case
            // revert was called inside tracker.processUnlock()
            // and a reason string was provided.
            return (false, bytes(reason));
        } catch (bytes memory reason) {
            // This is executed in case revert() was used
            // or there was a failing assertion, division
            // by zero, etc. inside tracker.processUnlock().
            return (false, reason);
        }
    }

    modifier onlyDeposits() {
        require(
            msg.sender == depositsAddress,
            CommonErrors.UNAUTHORIZED_CALLER
        );
        _;
    }
}
