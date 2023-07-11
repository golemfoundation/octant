// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import {CommonErrors} from "./Errors.sol";

/// @title Auth
contract Auth {
    /// @dev Emitted when the Golem Foundation multisig address is set.
    /// @param oldValue The old Golem Foundation multisig address.
    /// @param newValue The new Golem Foundation multisig address.
    event MultisigSet(address oldValue, address newValue);

    /// @dev Emitted when ownership transfer is initiated.
    /// @param previousOwner Old multisig, one that initiated the process.
    /// @param newOwner New multisig, one that should finalize the process.
    event OwnershipTransferStarted(
        address indexed previousOwner,
        address indexed newOwner
    );

    /// @dev The multisig address.
    address public multisig;

    /// @dev Pending multisig address.
    address public pendingOwner;

    /// @param _multisig The initial Golem Foundation multisig address.
    constructor(address _multisig) {
        require(_multisig != address(0), CommonErrors.INVALID_ARGUMENT);
        multisig = _multisig;
        emit MultisigSet(address(0), multisig);
    }

    /**
     * @dev Starts the ownership transfer of the contract to a new account. Replaces the pending transfer if there is one.
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) external {
        require(newOwner != address(0));
        require(msg.sender == multisig, CommonErrors.UNAUTHORIZED_CALLER);
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(multisig, newOwner);
    }

    /**
     * @dev The new owner accepts the ownership transfer.
     */
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, CommonErrors.UNAUTHORIZED_CALLER);
        emit MultisigSet(multisig, pendingOwner);
        multisig = pendingOwner;
        pendingOwner = address(0);
    }
}
