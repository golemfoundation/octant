pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEpochs.sol";

/**
 * @title Implementation of execution layer oracle.
 *
 * @notice The goal of the oracle is to provide balance of the Golem Foundation validator execution layer's account
 * which collects fee.
 * Balance for epoch will be taken from block which corresponds to end of Hexagon epoch (check `Epochs.sol` contract).
 */
contract ExecutionLayerOracle is Ownable {
    /// @notice Epochs contract address.
    IEpochs public immutable epochs;

    /// @notice validator's address collecting fees
    address public validatorAddress;

    /// @notice execution layer account balance in given epoch
    mapping(uint256 => uint256) public balanceByEpoch;

    /// @param epochsAddress Address of Epochs contract.
    constructor(address epochsAddress) {
        epochs = IEpochs(epochsAddress);
    }

    function setBalance(uint256 epoch, uint256 balance) external onlyOwner {
        require(
            epoch > 0 && epoch == epochs.getCurrentEpoch() - 1,
            "HN/can-set-balance-for-previous-epoch-only"
        );
        require(balanceByEpoch[epoch] == 0, "HN/balance-for-given-epoch-already-exists");
        balanceByEpoch[epoch] = balance;
    }

    function setValidatorAddress(address _validatorAddress) external onlyOwner {
        validatorAddress = _validatorAddress;
    }
}
