// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface ITracker {
    function processLock(address, uint224, uint224) external;

    function processUnlock(
        address,
        uint224,
        uint224
    ) external returns (bool, bytes memory);
}
