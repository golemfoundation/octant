// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

interface IDeposits {
    function deposits(address) external view returns (uint256);
}
