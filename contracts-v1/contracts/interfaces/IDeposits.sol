// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

interface IDeposits {
    /// @notice function deposits() returns user's GLMs locked amount by address
    function deposits(address) external view returns (uint256);
}
