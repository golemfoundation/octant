// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEpochs.sol";

import {EpochsErrors} from "./Errors.sol";

/// @title Epochs
/// @notice Contract which handles Octant epochs mechanism.
/// Epoch duration and time when decision window is open is calculated in seconds.
/// These values are set when deploying a contract but can later be changed with {setEpochDuration} and
/// {setDecisionWindow} by contract's owner.
contract Epochs is Ownable, IEpochs {

    /// @dev Struct to store the properties of an epoch.
    /// @param from The epoch number when this epoch starts.
    /// @param to The epoch number when this epoch ends.
    /// @param duration Epoch duration in seconds.
    /// @param decisionWindow Decision window in seconds.
    /// This value represents time, when participant can allocate funds to projects.
    /// It must be smaller or equal to {epochDuration}.
    struct EpochProps {
        uint256 from;
        uint256 to;
        uint256 duration;
        uint256 decisionWindow;
    }

    /// @notice Timestamp when octant starts.
    uint256 public start;

    /// @dev Index of current epoch properties in epochProps mapping.
    uint256 public epochPropsIndex;

    /// @dev Mapping to store the properties of all epochs.
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
        epochProps[0] = EpochProps({from : 1, to : 0, duration : _epochDuration, decisionWindow : _decisionWindow});
    }

    /// @notice Get the current epoch number.
    /// @dev Will revert when calling before the first epoch started.
    /// @return The current epoch number, number in range [1, inf)
    function getCurrentEpoch() public view returns (uint32) {
        require(isStarted(), EpochsErrors.NOT_STARTED);
        uint256 _start = start;
        uint256 _epochsOffset = 1;
        uint256 _epochDuration = epochProps[epochPropsIndex].duration;
        for (uint256 i = 0; i <= epochPropsIndex; i = i + 1) {
            if (epochProps[i].to != 0) {
                uint256 _epochPropsValidityTime = epochProps[i].to - epochProps[i].from;
                uint256 _summedDurationFromProps = _epochPropsValidityTime * epochProps[i].duration;

                if (block.timestamp <= _start + _summedDurationFromProps) {
                    return uint32(((block.timestamp - _start) / _epochDuration) + _epochsOffset);
                } else {
                    _epochsOffset = _epochsOffset + _epochPropsValidityTime;
                    _start = _start + _epochPropsValidityTime * epochProps[i].duration;
                }
            }
        }
        return uint32(((block.timestamp - _start) / _epochDuration) + _epochsOffset);
    }

    /// @dev Returns the duration of current epoch.
    /// @return The duration of current epoch in seconds.
    function getEpochDuration() external view returns (uint256) {
        uint32 _currentEpoch = getCurrentEpoch();
        for (uint256 i = 0; i <= epochPropsIndex; i = i + 1) {
            if (_arePropsValidForEpoch(epochProps[i], _currentEpoch)) {
                return epochProps[i].duration;
            }
        }
        return 0;
    }

    /// @dev Returns the duration of the decision window in current epoch.
    /// @return The the duration of the decision window in current epoch in seconds.
    function getDecisionWindow() external view returns (uint256) {
        uint32 _currentEpoch = getCurrentEpoch();
        for (uint256 i = 0; i <= epochPropsIndex; i = i + 1) {
            if (_arePropsValidForEpoch(epochProps[i], _currentEpoch)) {
                return epochProps[i].decisionWindow;
            }
        }
        return 0;
    }

    /// @return bool Whether the decision window is currently open or not.
    function isDecisionWindowOpen() public view returns (bool) {
        require(isStarted(), EpochsErrors.NOT_STARTED);
        EpochProps memory _currentEpochProps = epochProps[epochPropsIndex];
        uint256 moduloEpoch = uint256(
            (block.timestamp - start) % _currentEpochProps.duration
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
        uint32 _currentEpoch = getCurrentEpoch();
        epochProps[epochPropsIndex].to = _currentEpoch + 1;
        epochProps[epochPropsIndex + 1] = EpochProps({from : _currentEpoch + 1, to : 0, duration : _epochDuration, decisionWindow : _decisionWindow});
        epochPropsIndex = epochPropsIndex + 1;
    }

    /// @dev Checks if the provided epoch properties are valid for the given epoch.
    /// @param props The epoch properties to validate.
    /// @param _epoch The epoch to validate the properties for.
    /// @return True if the properties are valid for the epoch, false otherwise.
    function _arePropsValidForEpoch(EpochProps memory props, uint32 _epoch) private pure returns (bool) {
        return _epoch >= props.from && (props.to == 0 || _epoch < props.to);
    }
}
