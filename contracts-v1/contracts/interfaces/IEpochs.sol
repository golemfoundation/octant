// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface IEpochs {
    function getCurrentEpoch() external view returns (uint256);

    function getEpochDuration() external view returns (uint256);

    function getDecisionWindow() external view returns (uint256);

    function isStarted() external view returns (bool);

    function isDecisionWindowOpen() external view returns (bool);
}
