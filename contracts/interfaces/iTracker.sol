pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

interface iTracker {
    function processDeposit(address, uint, uint) external;
    function processWithdraw(address, uint, uint) external;
}
