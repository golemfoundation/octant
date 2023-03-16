// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "../interfaces/IDeposits.sol";
import "../interfaces/IOctantOracle.sol";
import "../interfaces/IEpochs.sol";
import "../interfaces/IAllocationsStorage.sol";
import "../interfaces/IProposals.sol";
import "../interfaces/IRewards.sol";

/// tightly coupled contracts
import "../deposits/Tracker.sol";

/// external dependencies
import "@prb/math/contracts/PRBMathUD60x18.sol";


/// @notice Contract responsible for calculating rewards from Octant GLM Governance Experiment.
/// Get more insight about calculations here: https://octantapp.notion.site/Octant-a-GLM-Governance-Experiment-e098d7ff9d55468db28b8b3584b5959c
contract Rewards is IRewards {
    using PRBMathUD60x18 for uint256;

    struct ProposalRewards {
        address proposalAddress;
        uint256 donated;
        uint256 matched;
    }

    /// @notice Effective deposit tracking.
    Tracker public immutable tracker;

    /// @notice ETH staking proceeds oracle.
    IOctantOracle public immutable oracle;

    /// @notice Actual proposals store.
    IProposals public immutable proposals;

    /// @notice Tracking user`s allocations.
    IAllocationsStorage public immutable allocationsStorage;

    constructor(
        address trackerAddress,
        address oracleAddress,
        address proposalsAddress,
        address allocationsStorageAddress
    ) {
        tracker = Tracker(trackerAddress);
        oracle = IOctantOracle(oracleAddress);
        proposals = IProposals(proposalsAddress);
        allocationsStorage = IAllocationsStorage(allocationsStorageAddress);
    }

    /// @notice Compute GLM staked by users at a particular epoch as ratio to total GLM token supply.
    /// @return value in the range of 0 to 1 represented in WEI. Parse it to Ether to get the floated ratio.
    /// example: 2288000000000 = 0.000002288 of total GLMs are staked
    function stakedRatio(uint32 epoch) public view returns (uint256) {
        uint256 tokenSupply = tracker.tokenSupplyAt(epoch);
        return tracker.totalDepositAt(epoch).div(tokenSupply);
    }

    /// @notice Compute total individual rewards for particular epoch.
    function allIndividualRewards(uint32 epoch) public view returns (uint256) {
        return oracle.getTotalETHStakingProceeds(epoch).mul(stakedRatio(epoch));
    }

    /// @notice Compute user's individual reward for particular epoch.
    function individualReward(
        uint32 epoch,
        address user
    ) public view returns (uint256) {
        uint256 myDeposit = tracker.depositAt(user, epoch);
        if (myDeposit == 0) {
            return 0;
        }
        uint256 allRewards = allIndividualRewards(epoch);
        uint256 individualShare = myDeposit.div(tracker.totalDepositAt(epoch));
        return allRewards.mul(individualShare);
    }

    /// @notice Compute user's claimable reward for particular epoch.
    function claimableReward(
        uint32 epoch,
        address user
    ) public view returns (uint256) {
        return allocationsStorage.getUserClaimableRewards(epoch, user);
    }

    /// @notice Compute total rewards to be distributed between users and proposals.
    function totalRewards(uint32 epoch) public view returns (uint256) {
        uint256 ratio = stakedRatio(epoch);
        return oracle.getTotalETHStakingProceeds(epoch).mul(ratio.sqrt());
    }

    /// @notice Compute matched rewards.
    /// Rewards to be distributed by Golem Foundation between proposals in particular epoch.
    function matchedRewards(uint32 epoch) public view returns (uint256) {
        return totalRewards(epoch) - allIndividualRewards(epoch);
    }

    /// @notice Calculates donated funds by participants in given epoch.
    /// @return 0: proposalRewardsSum - total donated ETH to all proposals in given epoch.
    /// 1: array of proposals rewards containing proposalAddress - proposal address, donated - donated by all users for
    /// this proposal in WEI, matched - 0 (to get matched reward value call matchedProposalRewards() method).
    function individualProposalRewards(
        uint32 epoch
    ) public view returns (uint256, ProposalRewards[] memory) {
        address[] memory proposalAddresses = proposals.getProposalAddresses(epoch);
        uint256 proposalRewardsSum;

        ProposalRewards[] memory proposalRewards = new ProposalRewards[](proposalAddresses.length);
        for (uint256 i = 0; i < proposalAddresses.length; i++) {
            proposalRewards[i].proposalAddress = proposalAddresses[i];
            uint256 _proposalAllocation = allocationsStorage.getProposalAllocation(epoch, proposalAddresses[i]);
            proposalRewards[i].donated = _proposalAllocation;
            proposalRewardsSum = proposalRewardsSum + _proposalAllocation;
        }

        return (proposalRewardsSum, proposalRewards);
    }

    /// @notice Calculates donated and matched funds by participants in given epoch.
    /// @return array of proposals rewards containing proposalAddress - proposal address, donated - donated by all users for
    /// this proposal in WEI, matched - amount donated by Golem Foundation to this proposal in WEI.
    function matchedProposalRewards(
        uint32 epoch
    ) external view returns (ProposalRewards[] memory) {
        (
        uint256 proposalRewardsSum,
        ProposalRewards[] memory proposalRewards
        ) = individualProposalRewards(epoch);

        (
        uint256 proposalDonationThreshold,
        uint256 proposalDonationAboveThresholdSum
        ) = _calculateProposalRewardsThreshold(
            proposalRewardsSum,
            proposalRewards
        );

        uint256 _matchedRewards = matchedRewards(epoch);

        // distribute matched rewards.
        for (uint256 i = 0; i < proposalRewards.length; i++) {
            if (proposalRewards[i].donated > proposalDonationThreshold) {
                uint256 proposalRewardsShare = proposalRewards[i]
                .donated
                .div(proposalDonationAboveThresholdSum);
                uint256 matchedProposalReward = _matchedRewards.mul(
                    proposalRewardsShare
                );
                proposalRewards[i].matched = matchedProposalReward;
            }
        }
        return proposalRewards;
    }

    /// @notice Calculates total proposal rewards (donated and matched) in particular epoch.
    /// @return Rewards amount assigned to this proposal in WEI.
    function proposalReward(
        uint32 epoch,
        address proposal
    ) external view returns (uint256) {
        (
        uint256 proposalRewardsSum,
        ProposalRewards[] memory proposalRewards
        ) = individualProposalRewards(epoch);

        (
        uint256 proposalDonationThreshold,
        uint256 proposalDonationAboveThresholdSum
        ) = _calculateProposalRewardsThreshold(
            proposalRewardsSum,
            proposalRewards
        );

        uint256 _matchedRewards = matchedRewards(epoch);
        // calculate total proposal rewards (donated + matched).
        for (uint256 i = 0; i < proposalRewards.length; i++) {
            if (
                proposalRewards[i].donated > proposalDonationThreshold &&
                proposalRewards[i].proposalAddress == proposal
            ) {
                uint256 proposalRewardsShare = proposalRewards[i]
                .donated
                .div(proposalDonationAboveThresholdSum);
                uint256 matchedProposalReward = _matchedRewards.mul(
                    proposalRewardsShare
                );
                return proposalRewards[i].donated + matchedProposalReward;
            }
        }
        return 0;
    }

    /// @notice Calculates Golem Foundation rewards (donations that didn't pass the threshold and
    /// individual rewards from users who didn't vote in particular epoch.
    /// @return amount in WEI.
    function golemFoundationReward(uint32 epoch) external view returns (uint256) {
        (
        uint256 proposalRewardsSum,
        ProposalRewards[] memory proposalRewards
        ) = individualProposalRewards(epoch);

        (,uint256 proposalDonationAboveThresholdSum) = _calculateProposalRewardsThreshold(
            proposalRewardsSum,
            proposalRewards
        );
        uint256 claimableRewardsSum = allocationsStorage.getTotalClaimableRewards(epoch);

        return allIndividualRewards(epoch) - proposalDonationAboveThresholdSum - claimableRewardsSum;
    }

    /// @notice In order to be eligible for receiving donations in the epoch,
    /// a proposal must pass a predefined threshold of individual donation.
    /// This threshold is calculated as 1/proposal length * 2.
    /// @return value in the range of 0 to 1 represented in WEI. Parse it to Ether to get the floated ratio.
    /// example: 250000000000000000 = 0.25 fraction
    function proposalRewardsThresholdFraction(uint32 epoch) external view returns (uint256) {
        address[] memory proposalAddresses = proposals.getProposalAddresses(epoch);
        uint256 denominator = proposalAddresses.length * 2 * 10 ** 18;
        return denominator.inv();
    }

    /// @notice In order to be eligible for receiving donations in the epoch,
    /// a proposal must pass a predefined threshold of individual donation.
    /// This threshold is calculated as 1/proposal length * 2.
    function _calculateProposalRewardsThreshold(
        uint256 proposalRewardsSum,
        ProposalRewards[] memory proposalRewards
    ) private pure returns (uint256, uint256) {
        /// proposalRewards array contains all proposals in given epoch, hence to get a threshold value
        /// we can just divide proposalRewardsSum by proposalRewards * 2
        uint256 proposalDonationThreshold = proposalRewardsSum / (proposalRewards.length * 2);

        // calculate proposal donation above threshold.
        uint256 proposalDonationAboveThresholdSum;
        for (uint256 i = 0; i < proposalRewards.length; i++) {
            if (proposalRewards[i].donated > proposalDonationThreshold) {
                proposalDonationAboveThresholdSum += proposalRewards[i]
                .donated;
            }
        }
        return (proposalDonationThreshold, proposalDonationAboveThresholdSum);
    }
}
