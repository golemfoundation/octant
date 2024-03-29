// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import {CommonErrors} from "./Errors.sol";
import "./Auth.sol";

/// @title OctantBase
/// @dev This is the base contract for all Octant contracts that have functions with access restricted
/// to deployer or the Golem Foundation multisig.
/// It provides functionality for setting and accessing the Golem Foundation multisig address.
abstract contract OctantBase {
    /// @dev The Auth contract instance
    Auth public immutable auth;

    /// @param _auth the contract containing Octant authorities.
    constructor(address _auth) {
        require(_auth != address(0), CommonErrors.INVALID_ARGUMENT);
        auth = Auth(_auth);
    }

    /// @dev Gets the Golem Foundation multisig address.
    function getMultisig() internal view returns (address) {
        return auth.multisig();
    }

    /// @dev Modifier that allows only the Golem Foundation multisig address to call a function.
    modifier onlyMultisig() {
        require(
            msg.sender == auth.multisig(),
            CommonErrors.UNAUTHORIZED_CALLER
        );
        _;
    }
}
