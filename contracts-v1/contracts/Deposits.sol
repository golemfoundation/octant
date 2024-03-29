// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import "./interfaces/IDeposits.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {DepositsErrors, CommonErrors} from "./Errors.sol";
import "./OctantBase.sol";

/// @title Contract tracking GLM deposits for Octant project.
/// @author Golem Foundation
/// @notice GLM can be locked or unlocked at any moment by its owner.
/// To be more capital effective, do lock at the end of an epoch,
/// and unlock at the beginning of an epoch.
/// @dev Please note that complexity of this contract should be kept as low as possible,
/// even at the cost of increased complexity of other contracts. Lets strive to limit
/// risk exposure of GLM deposits.
contract Deposits is OctantBase, IDeposits {
    /// @notice GLM token contract address
    ERC20 public immutable glm;

    event Locked(
        uint256 depositBefore,
        uint256 amount,
        uint256 when,
        address user
    );
    event Unlocked(
        uint256 depositBefore,
        uint256 amount,
        uint256 when,
        address user
    );

    /// @dev deposit amounts per user
    mapping(address => uint256) public deposits;

    /// @param glmAddress Address of Golem Network Token contract (updated, GLM).
    constructor(address glmAddress, address _auth) OctantBase(_auth) {
        require(glmAddress != address(0), CommonErrors.INVALID_ARGUMENT);
        glm = ERC20(glmAddress);
    }

    /// @notice Lock GLM to enable participation in Octant experiment.
    /// This can be done at any time, but it is most capital effective at the end of the epoch.
    /// @param amount Amount of GLM to be locked.
    function lock(uint256 amount) external {
        require(amount != 0, CommonErrors.INVALID_ARGUMENT);

        uint256 oldDeposit = deposits[msg.sender];
        deposits[msg.sender] = oldDeposit + amount;
        require(
            glm.transferFrom(msg.sender, address(this), amount),
            DepositsErrors.GLM_TRANSFER_FAILED
        );
        emit Locked(oldDeposit, amount, block.timestamp, msg.sender);
    }

    /// @notice Unlock GLM. This can be done at any time, but it is most capital effective at the beginning of the epoch.
    /// @param amount Amount of GLM to be unlocked.
    function unlock(uint256 amount) external {
        uint256 oldDeposit = deposits[msg.sender];
        require(oldDeposit >= amount, DepositsErrors.DEPOSIT_IS_TO_SMALL);
        deposits[msg.sender] = oldDeposit - amount;
        require(glm.transfer(msg.sender, amount));
        emit Unlocked(oldDeposit, amount, block.timestamp, msg.sender);
    }
}
