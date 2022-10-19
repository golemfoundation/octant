// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IEpochs.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/*
 * Contract tracking GLM deposits (staking) for Hexagon project.
 * Funds can be deposited or withdrawn at any moment.
 * Time is split into epochs, effective deposit is defined as min value
 * of GLM deposited by an address in the epoch.
 *
 * To be more capital effective, do deposits at the end of an epoch,
 * and withdrawals at the beginning of an epoch.
 */

contract Deposits {
    ERC20 public immutable glm;
    IEpochs public immutable epochs;

    event Deposited(uint256 amount, uint256 when, address depositor);
    event Withdrawn(uint256 amount, uint256 when, address depositor);

    struct EffectiveDeposit {
        bool isSet; // set to true to distinguish between null and zero values of ED
        uint256 amount;
    }

    mapping(address => uint256) public deposits;
    mapping(address => mapping(uint256 => EffectiveDeposit)) private effectiveDeposits;

    constructor(address epochsAddress, address glmAddress) {
        epochs = IEpochs(epochsAddress);
        glm = ERC20(glmAddress);
    }

    function deposit(uint256 amount) public {
        uint256 current = deposits[msg.sender];
        deposits[msg.sender] = current + amount;
        uint256 epoch = epochs.getCurrentEpoch();
        _updatePrevED(epoch, current);
        _updateCurrentED(epoch, current);
        require(
            glm.transferFrom(msg.sender, address(this), amount),
            "HN/cannot-transfer-from-sender"
        );
        emit Deposited(amount, block.timestamp, msg.sender);
    }

    function withdraw(uint256 amount) public {
        uint256 current = deposits[msg.sender];
        require(current >= amount, "HN/deposit-is-smaller");
        deposits[msg.sender] = current - amount;
        uint256 epoch = epochs.getCurrentEpoch();
        _updatePrevED(epoch, current);
        require(glm.transfer(msg.sender, amount));
        emit Withdrawn(amount, block.timestamp, msg.sender);
    }

    function depositAt(address owner, uint256 epochNo) public view returns (uint256) {
        uint256 currentEpoch = epochs.getCurrentEpoch();
        require(epochNo <= currentEpoch, "HN/future-is-unknown");
        require(epochNo > 0, "HN/epochs-start-from-1");
        for (uint256 iEpoch = epochNo; iEpoch <= currentEpoch; iEpoch = iEpoch + 1) {
            if (effectiveDeposits[owner][iEpoch].isSet) {
                return _applyDepositCutoff(effectiveDeposits[owner][iEpoch].amount);
            }
        }
        return _applyDepositCutoff(deposits[owner]);
    }

    function _applyDepositCutoff(uint256 actualAmount) public pure returns (uint256) {
        if (actualAmount < 100 ether) {
            return 0;
        }
        return actualAmount;
    }

    function _updatePrevED(uint256 epoch, uint256 currentDeposit) private {
        EffectiveDeposit memory prevED = effectiveDeposits[msg.sender][epoch - 1];
        if (!prevED.isSet) {
            prevED.isSet = true;
            prevED.amount = currentDeposit;
        }
        effectiveDeposits[msg.sender][epoch - 1] = prevED;
    }

    function _updateCurrentED(uint256 epoch, uint256 currentDeposit) private {
        EffectiveDeposit memory currentED = effectiveDeposits[msg.sender][epoch];
        if (!currentED.isSet) {
            currentED.amount = currentDeposit;
        } else {
            currentED.amount = _min(currentDeposit, currentED.amount);
        }
        currentED.isSet = true;
        effectiveDeposits[msg.sender][epoch] = currentED;
    }

    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a <= b ? a : b;
    }
}
