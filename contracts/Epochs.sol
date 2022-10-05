pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEpochs.sol";

contract Epochs is Ownable, IEpochs {
    uint256 public start;
    uint256 public epochDuration;
    uint256 public decisionWindow;

    constructor(
        uint256 _start,
        uint256 _epochDuration,
        uint256 _decisionWindow
    ) {
        start = _start;
        epochDuration = _epochDuration;
        decisionWindow = _decisionWindow;
    }

    function getCurrentEpoch() public view returns (uint32) {
        require(isStarted(), "HN/not-started-yet");
        return uint32(((block.timestamp - start) / epochDuration) + 1);
    }

    function isDecisionWindowOpen() public view returns (bool) {
        require(isStarted(), "HN/not-started-yet");
        uint32 moduloEpoch = uint32((block.timestamp - start) % epochDuration);
        return moduloEpoch <= decisionWindow;
    }

    function isStarted() public view returns (bool) {
        return block.timestamp > start;
    }

    function setEpochDuration(uint256 _epochDuration) external onlyOwner {
        epochDuration = _epochDuration;
    }

    function setDecisionWindow(uint256 _decisionWindow) external onlyOwner {
        decisionWindow = _decisionWindow;
    }
}
