pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

interface IEpochs {
    function getCurrentEpoch() external view returns (uint32);

    function isStarted() external view returns (bool);

    function isDecisionWindowOpen() external view returns (bool);
}
