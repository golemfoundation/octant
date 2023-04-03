// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import {CommonErrors} from "./Errors.sol";

/// @title Auth
contract Auth {

    /// @dev Emitted when the Golem Foundation multisig address is set.
    /// @param oldValue The old Golem Foundation multisig address.
    /// @param newValue The new Golem Foundation multisig address.
    event MultisigSet(address oldValue, address newValue);

    /// @dev The deployer address.
    address public immutable deployer;

    /// @dev The multisig address.
    address public multisig;

    /// @param _multisig The initial Golem Foundation multisig address.
    constructor(address _multisig) {
        multisig = _multisig;
        deployer = msg.sender;
    }

    /// @dev Sets the multisig address.
    /// @param _multisig The new multisig address.
    function setMultisig(address _multisig) external {
        require(msg.sender == multisig, CommonErrors.UNAUTHORIZED_CALLER);
        emit MultisigSet(multisig, _multisig);
        multisig = _multisig;
    }
}
