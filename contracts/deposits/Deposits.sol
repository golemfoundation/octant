// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

import "../interfaces/ITracker.sol";
import "../interfaces/IDeposits.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {DepositsErrors} from "../Errors.sol";

/// @title Contract tracking GLM deposits (staking) for Hexagon project.
/// @author Golem Foundation
/// @notice GLM can be deposited or withdrawn at any moment by its owner.
/// To be more capital effective, do deposits at the end of an epoch,
/// and withdrawals at the beginning of an epoch.
/// @dev Please note that complexity of this contract should be kept as low as possible,
/// even at the cost of increased complexity of other contracts. Lets strive to limit
/// risk exposure of GLM deposits. This is why effective deposit tracking is outside
/// in a contract that can fail without affecting withdrawal calls.
contract Deposits is Ownable, IDeposits {
    /// @notice GLM token contract address
    ERC20 public immutable glm;

    /// @notice Effective Deposits tracker contract address
    ITracker public tracker;

    event Deposited(uint224 amount, uint256 when, address depositor);
    event Withdrawn(uint224 amount, uint256 when, address depositor);
    event TrackerUpdated();
    event TrackerFailed(bytes reason);

    /// @dev deposit amounts per depositor
    mapping(address => uint256) public deposits;

    /// @param glmAddress Address of Golem Network Token contract (updated, GLM).
    constructor(address glmAddress) {
        glm = ERC20(glmAddress);
    }

    function setDepositTrackerAddress(address newDT) external onlyOwner {
        tracker = ITracker(newDT);
    }

    /// @notice Deposit GLM to enable participation in Hexagon experiment.
    /// This can be done at any time, but it is most capital effective at the end of the epoch.
    /// @param amount Amount of GLM to be deposited.
    function deposit(uint224 amount) external {
        uint224 oldDeposit = uint224(deposits[msg.sender]);
        deposits[msg.sender] = oldDeposit + amount;
        require(
            glm.transferFrom(msg.sender, address(this), amount),
            DepositsErrors.GLM_TRANSFER_FAILED
        );
        emit Deposited(amount, block.timestamp, msg.sender);

        tracker.processDeposit(msg.sender, oldDeposit, amount);
    }

    /// @notice Withdraw GLM. This can be done at any time, but it is most capital effective at the beginning of the epoch.
    /// @param amount Amount of GLM to be withdrawn.
    function withdraw(uint224 amount) external {
        uint224 oldDeposit = uint224(deposits[msg.sender]);
        require(oldDeposit >= amount, DepositsErrors.DEPOSIT_IS_TO_SMALL);
        deposits[msg.sender] = oldDeposit - amount;
        require(glm.transfer(msg.sender, amount));
        emit Withdrawn(amount, block.timestamp, msg.sender);

        (bool result, bytes memory error) = tracker.processWithdraw(msg.sender, oldDeposit, amount);
        if (result) {
            emit TrackerUpdated();
        } else {
            emit TrackerFailed(error);
        }
    }
}
