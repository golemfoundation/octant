// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IEpochs.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Contract tracking GLM deposits (staking) for Hexagon project.
/// @author Golem Foundation
/// @notice GLM can be deposited or withdrawn at any moment by its owner.
/// @notice To be more capital effective, do deposits at the end of an epoch,
/// @notice and withdrawals at the beginning of an epoch.
/// @dev Time is split into epochs, effective deposit is defined as min value
/// @dev of GLM held by this contract on behalf of the depositor in particular epoch.
/// @dev This contract MUST be as simple as possible.
contract Deposits {
    /// @notice GLM token contract address
    ERC20 public immutable glm;
    /// @notice Epochs contract address.
    IEpochs public immutable epochs;

    event Deposited(uint256 amount, uint256 when, address depositor);
    event Withdrawn(uint256 amount, uint256 when, address depositor);

    struct EffectiveDeposit {
        bool isSet; // set to true to distinguish between null and zero values of ED
        uint256 amount;
    }

    /// @dev deposit amounts per depositor
    mapping(address => uint256) public deposits;

    // TODO: move effectiveDeposits structure, updatePrevED, updateCurrentED and calls to epoch to external contract
    /// @dev helper structure for effective deposit amounts tracking. See `depositAt` function
    mapping(address => mapping(uint256 => EffectiveDeposit)) private effectiveDeposits;

    /// @param epochsAddress Address of Epochs contract.
    /// @param glmAddress Address of Golem Network Token contract (updated, GLM).
    constructor(address epochsAddress, address glmAddress) {
        epochs = IEpochs(epochsAddress);
        glm = ERC20(glmAddress);
    }

    /// @notice Deposit GLM to enable participation in Hexagon experiment.
    /// @notice This can be done at any time, but it is most capital effective at the end of the epoch.
    /// @param amount Amount of GLM to be deposited.
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

    /// @notice Withdrawl GLM. This can be done at any time, but it is most capital effective at the beginning of the epoch.
    /// @param amount Amount of GLM to be withdrawn.
    function withdraw(uint256 amount) public {
        uint256 current = deposits[msg.sender];
        require(current >= amount, "HN/deposit-is-smaller");
        deposits[msg.sender] = current - amount;
        uint256 epoch = epochs.getCurrentEpoch();
        _updatePrevED(epoch, current);
        require(glm.transfer(msg.sender, amount));
        emit Withdrawn(amount, block.timestamp, msg.sender);
    }

    /// @notice Check how much is staked at particular epoch. Note that contract tracks only minimal value of the stake.
    /// @dev Call this to read ED for any user at particular epoch. Please note that worst-case gas cost is O(n) where n is_
    /// @dev the number of epochs contract has been active for.
    /// @param owner Owner of the deposit for which ED will be checked.
    /// @param epochNo Epoch number, for which ED will be checked.
    /// @return Effective deposit (GLM) in wei for particular epoch, particular owner.
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

    /// @dev Implements cutoff of 100 GLM. Amounts lower than that are not eligible for rewards.
    /// @param actualAmount Amount of GLM currently deposited.
    /// @return Amount of GLM adjusted by 100 GLM cutoff.
    function _applyDepositCutoff(uint256 actualAmount) public pure returns (uint256) {
        if (actualAmount < 100 ether) {
            return 0;
        }
        return actualAmount;
    }

    /// @dev Sets ED in a situation when funds are moved after a period of inactivity.
    function _updatePrevED(uint256 epoch, uint256 currentDeposit) private {
        EffectiveDeposit memory prevED = effectiveDeposits[msg.sender][epoch - 1];
        if (!prevED.isSet) {
            prevED.isSet = true;
            prevED.amount = currentDeposit;
        }
        effectiveDeposits[msg.sender][epoch - 1] = prevED;
    }

    /// @dev Tracks ED as min(deposit) for current epoch.
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

    /// @dev return smaller of two number values
    function _min(uint256 a, uint256 b) private pure returns (uint256) {
        return a <= b ? a : b;
    }
}
