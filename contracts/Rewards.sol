// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IDeposits.sol";
import "./interfaces/IHexagonOracle.sol";
import "./interfaces/IEpochs.sol";

/// tightly coupled contracts
import "./Tracker.sol";

/// external dependencies
import "@prb/math/contracts/PRBMathUD60x18.sol";

contract Rewards {
    using PRBMathUD60x18 for uint256;

    /// @notice Epochs contract.
    IEpochs public immutable epochs;

    /// @notice GLM deposits contract.
    IDeposits public immutable deposits;

    /// @notice Effective deposit tracking.
    Tracker public immutable tracker;

    /// @notice ETH staking proceeds oracle.
    IHexagonOracle public immutable oracle;

    constructor(
        address epochsAddress,
        address depositsAddress,
        address trackerAddress,
        address oracleAddress
    ) {
        epochs = IEpochs(epochsAddress);
        deposits = IDeposits(depositsAddress);
        tracker = Tracker(trackerAddress);
        oracle = IHexagonOracle(oracleAddress);
    }

    /// @notice Compute funds staked at a particular epoch as ratio to total GLM token supply.
    function stakedRatio(uint256 epoch) public view returns (uint256) {
        uint256 tokenSupply = tracker.tokenSupplyAt(epoch);
        return tracker.totalDepositAt(epoch).div(tokenSupply);
    }

    /// @notice Compute total individual rewards for particular epoch.
    function allIndividualRewards(uint256 epoch) public view returns (uint256) {
        return oracle.getTotalETHStakingProceeds(epoch).mul(stakedRatio(epoch));
    }

    /// @notice Compute owner's individual reward for particular epoch.
    function individualReward(uint256 epoch, address individual) public view returns (uint256) {
        uint256 allRewards = allIndividualRewards(epoch);
        uint256 individualShare = tracker.depositAt(individual, epoch).div(
            tracker.totalDepositAt(epoch)
        );
        return allRewards.mul(individualShare);
    }
}
