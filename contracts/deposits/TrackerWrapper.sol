// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "../interfaces/ITracker.sol";
import "./Tracker.sol";

import {TrackerErrors, CommonErrors} from "../Errors.sol";

/// @title Proxy to contract tracking effective deposits across epochs (Hexagon).
/// @author Golem Foundation
/// @notice This contract is a proxy to Tracker. Purpose of it is to catch errors from Tracker and
/// convert it to boolean value.
contract TrackerWrapper is ITracker {
    /// @notice Tracker contract address.
    Tracker public immutable tracker;

    address public depositsAddress;

    constructor(address _trackerAddress, address _depositsAddress) {
        tracker = Tracker(_trackerAddress);
        depositsAddress = _depositsAddress;
    }

    /// @dev Handle GLM deposit, compute epoch effective deposit.
    /// @param owner Owner of GLM
    /// @param oldDeposit Last value of owner's GLM deposit
    /// @param amount New funds being deposited.
    function processDeposit(
        address owner,
        uint224 oldDeposit,
        uint224 amount
    ) external onlyDeposits {
        tracker.processDeposit(owner, oldDeposit, amount);
    }

    /// @dev Handle GLM withdrawal, compute epoch effective deposit.
    /// @param owner Owner of GLM
    /// @param oldDeposit Last value of owner's GLM deposit
    /// @param amount Amount of funds being withdrawed.
    /// @return true if computation was successful, false in case of any error
    function processWithdraw(
        address owner,
        uint224 oldDeposit,
        uint224 amount
    ) external onlyDeposits returns (bool, bytes memory) {
        try tracker.processWithdraw(owner, oldDeposit, amount) {
            return (true, "");
        } catch Error(string memory reason) {
            // This is executed in case
            // revert was called inside _processWithdraw
            // and a reason string was provided.
            return (false, bytes(reason));
        } catch (bytes memory reason) {
            // This is executed in case revert() was used
            // or there was a failing assertion, division
            // by zero, etc. inside _processWithdraw.
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
