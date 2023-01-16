// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEpochs.sol";

import {OracleErrors} from "../Errors.sol";

/// @title Implementation of Beacon chain oracle
/// @notice The goal of the oracle is to provide balance of the Golem Foundation validator's account on the consensus layer.
/// Balance for epoch will be taken just after the epoch finished (check `Epochs.sol` contract).
contract BeaconChainOracle is Ownable {
    /// @notice Epochs contract address.
    IEpochs public immutable epochs;

    /// @notice Foundation validator's indexes
    string public validatorIndexes;

    /// @notice balance from beacon chain in given epoch
    mapping(uint256 => uint256) public balanceByEpoch;

    /// @param epochsAddress Address of Epochs contract.
    constructor(address epochsAddress) {
        epochs = IEpochs(epochsAddress);
    }

    /// @notice set ETH balance in given epoch. Balance has to be in WEI.
    /// Updating epoch other then previous or setting the balance multiple times will be reverted.
    function setBalance(uint256 epoch, uint256 balance) external onlyOwner {
        require(
            epoch > 0 && epoch == epochs.getCurrentEpoch() - 1,
            OracleErrors.CANNOT_SET_BALANCE_FOR_PAST_EPOCHS
        );
        require(balanceByEpoch[epoch] == 0, OracleErrors.BALANCE_ALREADY_SET);
        balanceByEpoch[epoch] = balance;
    }

    /// @notice set beaconchain validator indexes as string split by comma.
    /// example: 1,2,5,6,10,123,2347
    function setValidatorIndexes(string memory _validatorIndexes) external onlyOwner {
        validatorIndexes = _validatorIndexes;
    }
}
