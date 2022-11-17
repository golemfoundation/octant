pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

interface ITracker {
    function processDeposit(
        address,
        uint256,
        uint256
    ) external;

    function processWithdraw(
        address,
        uint256,
        uint256
    ) external;
}
