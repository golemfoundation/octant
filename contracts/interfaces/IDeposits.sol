pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

interface IDeposits {
    function deposits(address) external view returns (uint256);
}
