// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEpochs.sol";

import {EpochsErrors} from "./Errors.sol";

/// @title Epochs
/// @notice Contract which handles Octant epochs mechanism.
/// Epoch duration and time when decision window is open is calculated in seconds.
/// These values are set when deploying a contract but can later be changed by calling
/// {setEpochProps} function.
contract Epochs is Ownable, IEpochs {

    /// @dev Struct to store the properties of an epoch.
    /// @param from The epoch number from which properties are valid (inclusive).
    /// @param fromTs Timestamp from which properties are valid.
    /// @param to The epoch number to which properties are valid (inclusive).
    /// @param duration Epoch duration in seconds.
    /// @param decisionWindow Decision window in seconds.
    /// This value represents time, when participant can allocate funds to projects.
    /// It must be smaller or equal to {epochDuration}.
    struct EpochProps {
        uint256 from;
        uint256 fromTs;
        uint256 to;
        uint256 duration;
        uint256 decisionWindow;
    }

    /// @notice Timestamp when octant starts.
    uint256 public start;

    /// @dev Index of current or next epoch properties in epochProps mapping.
    uint256 public epochPropsIndex;

    /// @dev Mapping to store all properties of epochs.
    mapping(uint256 => EpochProps) public epochProps;

    /// @dev Constructor to initialize start and the first epoch properties.
    /// @param _start Timestamp when octant starts.
    /// @param _epochDuration Duration of an epoch in seconds.
    /// @param _decisionWindow Decision window in seconds for the first epoch.
    constructor(
        uint256 _start,
        uint256 _epochDuration,
        uint256 _decisionWindow
    ) {
        start = _start;
        epochProps[0] = EpochProps({from : 1, fromTs: block.timestamp, to : 0, duration : _epochDuration, decisionWindow : _decisionWindow});
    }

    /// @notice Get the current epoch number.
    /// @dev Will revert when calling before the first epoch started.
    /// @return The current epoch number, number in range [1, inf)
    function getCurrentEpoch() public view returns (uint32) {
        require(isStarted(), EpochsErrors.NOT_STARTED);
        EpochProps memory _currentEpochProps = getCurrentEpochProps();
        if (_currentEpochProps.to != 0) {
            return uint32(_currentEpochProps.to);
        }
        return uint32(((block.timestamp - _currentEpochProps.fromTs) / _currentEpochProps.duration) + _currentEpochProps.from);
    }

    /// @dev Returns the duration of current epoch.
    /// @return The duration of current epoch in seconds.
    function getEpochDuration() external view returns (uint256) {
        EpochProps memory _currentEpochProps = getCurrentEpochProps();
        return _currentEpochProps.duration;
    }

    /// @dev Returns the duration of the decision window in current epoch.
    /// @return The the duration of the decision window in current epoch in seconds.
    function getDecisionWindow() external view returns (uint256) {
        EpochProps memory _currentEpochProps = getCurrentEpochProps();
        return _currentEpochProps.decisionWindow;
    }

    /// @return bool Whether the decision window is currently open or not.
    function isDecisionWindowOpen() public view returns (bool) {
        require(isStarted(), EpochsErrors.NOT_STARTED);
        uint32 _currentEpoch = getCurrentEpoch();
        if (_currentEpoch == 1) {
            return false;
        }

        EpochProps memory _currentEpochProps = getCurrentEpochProps();
        uint256 moduloEpoch = uint256(
            (block.timestamp - _currentEpochProps.fromTs) % _currentEpochProps.duration
        );
        return moduloEpoch <= _currentEpochProps.decisionWindow;
    }

    /// @return bool Whether Octant has started or not.
    function isStarted() public view returns (bool) {
        return block.timestamp >= start;
    }

    /// @dev Sets the epoch properties of the next epoch.
    /// @param _epochDuration Epoch duration in seconds.
    /// @param _decisionWindow Decision window in seconds.
    function setEpochProps(uint256 _epochDuration, uint256 _decisionWindow) external onlyOwner {
        require(_epochDuration >= _decisionWindow, EpochsErrors.DECISION_WINDOW_TOO_BIG);
        EpochProps memory _props = getCurrentEpochProps();

        // Next epoch props set up for the first time in this epoch. Storing the new props under
        // incremented epochPropsIndex.
        if (_props.to == 0) {
            uint32 _currentEpoch = getCurrentEpoch();
            uint256 _currentEpochEnd = _calculateCurrentEpochEnd(_currentEpoch, _props);
            epochProps[epochPropsIndex].to = _currentEpoch;
            epochProps[epochPropsIndex + 1] = EpochProps({from : _currentEpoch + 1, fromTs: _currentEpochEnd,
            to : 0, duration : _epochDuration, decisionWindow : _decisionWindow});
            epochPropsIndex = epochPropsIndex + 1;
        // Next epoch props were set up before, props are being updated. EpochPropsIndex has been
        // updated already, changing props in the latest epochPropsIndex
        } else {
            epochProps[epochPropsIndex].duration = _epochDuration;
            epochProps[epochPropsIndex].decisionWindow = _decisionWindow;
        }
    }

    /// @dev Gets the epoch properties of current epoch.
    function getCurrentEpochProps() public view returns (EpochProps memory) {
        if(epochProps[epochPropsIndex].fromTs > block.timestamp) {
            return epochProps[epochPropsIndex - 1];
        }
        return epochProps[epochPropsIndex];
    }

    /// @dev Gets current epoch end timestamp.
    function getCurrentEpochEnd() external view returns (uint256) {
        uint32 _currentEpoch = getCurrentEpoch();
        EpochProps memory _props = getCurrentEpochProps();
        return _calculateCurrentEpochEnd(_currentEpoch, _props);
    }

    /// @dev Calculates current epoch end timestamp.
    function _calculateCurrentEpochEnd(uint32 _currentEpoch, EpochProps memory _props) private pure returns (uint256) {
        return _props.fromTs + _props.duration * (1 + _currentEpoch - _props.from);
    }
}
