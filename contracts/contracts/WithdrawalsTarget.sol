// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import {CommonErrors} from "./Errors.sol";
import "./interfaces/IWithdrawalsTarget.sol";
import "./OctantBase.sol";

/// @title WithdrawalsTarget
/// @notice Contract that receives both ETH staking rewards and unstaked ETH
/// @author Golem Foundation
contract WithdrawalsTarget is OctantBase, IWithdrawalsTarget {
    /// @notice Address of the Vault contract that will be eligible to withdraw ETH from this contract
    address public vault;

    // TODO to be removed in OCT-355
    address public withdrawer;

    // TODO to be removed in OCT-355
    function setWithdrawer(address _withdrawer) public {
        withdrawer = _withdrawer;
    }

    /// @dev Emitted when the Vault address is set.
    /// @param oldValue The old Vault address.
    /// @param newValue The new Vault address.
    event VaultSet(address oldValue, address newValue);

    /// @dev Emitted when ETH is withdrawn from target.
    /// @param to The address to send the rewards ETH to.
    /// @param amount The amount of rewards ETH to send (WEI).
    event Withdrawn(address to, uint256 amount);

    constructor(address _auth) OctantBase(_auth) {
    }

    /// @notice Withdraws rewards ETH to the the vault.
    /// @param _amount The amount of rewards ETH to send (WEI).
    // TODO change to onlyVault in OCT-355
    function withdrawToVault(uint256 _amount) external onlyWithdrawer {
        payable(vault).transfer(_amount);
        emit Withdrawn(vault, _amount);
    }

    /// @notice Withdraws rewards ETH to multisig.
    /// @param _amount The amount of rewards ETH to send (WEI).
    function withdrawToMultisig(uint256 _amount) external onlyVault {
        _withdrawToMultisig(_amount);
    }

    /// @notice Withdraws unstaked ETH to the multisig address.
    /// @param _amount The amount of unstaked ETH to withdraw (WEI).
    function withdrawUnstaked(uint256 _amount) external onlyMultisig {
        _withdrawToMultisig(_amount);
    }

    /// @notice Sets the address of the Vault contract that will be eligible to withdraw ETH.
    /// @param newVault The new Vault address.
    function setVault(address newVault) external onlyMultisig {
        vault = newVault;
        emit VaultSet(vault, newVault);
    }

    function _withdrawToMultisig(uint256 _amount) private {
        address multisig = super.getMultisig();
        payable(multisig).transfer(_amount);
        emit Withdrawn(multisig, _amount);
    }

    /// @dev Modifier that allows only the Vault contract to call a function.
    modifier onlyVault() {
        require(msg.sender == vault, CommonErrors.UNAUTHORIZED_CALLER);
        _;
    }

    // TODO to be removed in OCT-355
    modifier onlyWithdrawer() {
        require(msg.sender == withdrawer, CommonErrors.UNAUTHORIZED_CALLER);
        _;
    }

    receive() external payable {
        /* do not add any code here, it will get reverted because of tiny gas stipend */
    }
}
