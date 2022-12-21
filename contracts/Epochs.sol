pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEpochs.sol";

/**
 * @notice Contract which handles Hexagon epochs mechanism.
 *
 * Epoch duration and time when decision window is open is calculated in seconds.
 * These values are set when deploying a contract but can later be changed with {setEpochDuration} and
 * {setDecisionWindow} by contract's owner.
 */
contract Epochs is Ownable, IEpochs {
    /// @notice Timestamp when hexagon starts.
    uint256 public start;

    /// @notice Epoch duration in seconds.
    uint256 public epochDuration;

    /**
     * @notice Decision window in seconds.
     *
     * This value represents time, when participant can allocate founds to projects.
     * It must be smaller or equal then {epochDuration}.
     */
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

    function getCurrentEpoch() public view returns (uint256) {
        require(isStarted(), "HN/not-started-yet");
        return uint256(((block.timestamp - start) / epochDuration) + 1);
    }

    function isDecisionWindowOpen() public view returns (bool) {
        require(isStarted(), "HN/not-started-yet");
        uint256 moduloEpoch = uint256((block.timestamp - start) % epochDuration);
        return moduloEpoch <= decisionWindow;
    }

    function isStarted() public view returns (bool) {
        return block.timestamp >= start;
    }

    function setEpochDuration(uint256 _epochDuration) external onlyOwner {
        epochDuration = _epochDuration;
    }

    function setDecisionWindow(uint256 _decisionWindow) external onlyOwner {
        decisionWindow = _decisionWindow;
    }
}
