// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "../interfaces/IDeposits.sol";
import "../interfaces/IHexagonOracle.sol";
import "../interfaces/IEpochs.sol";
import "../interfaces/IAllocationsStorage.sol";
import "../interfaces/IProposals.sol";
import "../interfaces/IRewards.sol";

/// tightly coupled contracts
import "../deposits/Tracker.sol";

/// external dependencies
import "@prb/math/contracts/PRBMathUD60x18.sol";

/// @notice Contract responsible for calculating rewards from Hexagon GLM Governance Experiment.
/// Get more insight about calculations here: https://hexagonapp.notion.site/Hexagon-a-GLM-Governance-Experiment-e098d7ff9d55468db28b8b3584b5959c
contract Rewards is IRewards {
    using PRBMathUD60x18 for uint256;

    struct ProposalRewards {
        uint256 id;
        uint256 donated;
        uint256 matched;
    }

    /// @notice In order to be eligible for receiving donations in the epoch,
    /// a proposal must pass a predefined threshold of individual donation.
    /// This threshold is expressed as a percentage.
    uint256 public constant PROPOSAL_DONATION_THRESHOLD_PERCENT = 10;

    /// @notice Epochs contract.
    IEpochs public immutable epochs;

    /// @notice GLM deposits contract.
    IDeposits public immutable deposits;

    /// @notice Effective deposit tracking.
    Tracker public immutable tracker;

    /// @notice ETH staking proceeds oracle.
    IHexagonOracle public immutable oracle;

    /// @notice Actual proposals store.
    IProposals public immutable proposals;

    /// @notice Tracking user`s allocations.
    IAllocationsStorage public immutable allocationsStorage;

    constructor(
        address epochsAddress,
        address depositsAddress,
        address trackerAddress,
        address oracleAddress,
        address proposalsAddress,
        address allocationsStorageAddress
    ) {
        epochs = IEpochs(epochsAddress);
        deposits = IDeposits(depositsAddress);
        tracker = Tracker(trackerAddress);
        oracle = IHexagonOracle(oracleAddress);
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
        uint256 ir = individualReward(epoch, user);
        uint256 allocationsSum;
        IAllocationsStorage.Allocation[] memory allocations = allocationsStorage
            .getUserAllocations(epoch, user);
        for (uint256 i = 0; i < allocations.length; i++) {
            allocationsSum += allocations[i].allocation;
        }
        return ir - allocationsSum;
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
    /// 1: array of proposals rewards containing id - proposal id, donated - donated by all users for
    /// this proposal in WEI, matched - 0 (to get matched reward value call matchedProposalRewards() method).
    function individualProposalRewards(
        uint32 epoch
    ) public view returns (uint256, ProposalRewards[] memory) {
        uint256[] memory proposalIds = proposals.getProposalIds(epoch);
        uint256 proposalRewardsSum;
        ProposalRewards[] memory proposalRewards = new ProposalRewards[](
            proposalIds.length
        );
        for (
            uint256 iProposal = 0;
            iProposal < proposalIds.length;
            iProposal++
        ) {
            proposalRewards[iProposal].id = proposalIds[iProposal];
            (
                address[] memory users,
                uint256[] memory allocations
            ) = allocationsStorage.getUsersWithTheirAllocations(
                    epoch,
                    proposalIds[iProposal]
                );

            // count individual rewards for proposals.
            for (uint256 iUser = 0; iUser < users.length; iUser++) {
                proposalRewards[iProposal].donated =
                    proposalRewards[iProposal].donated +
                    allocations[iUser];
                proposalRewardsSum = proposalRewardsSum + allocations[iUser];
            }
        }
        return (proposalRewardsSum, proposalRewards);
    }

    /// @notice Calculates donated and matched funds by participants in given epoch.
    /// @return array of proposals rewards containing id - proposal id, donated - donated by all users for
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
        for (uint256 iReward = 0; iReward < proposalRewards.length; iReward++) {
            if (proposalRewards[iReward].donated > proposalDonationThreshold) {
                uint256 proposalRewardsShare = proposalRewards[iReward]
                    .donated
                    .div(proposalDonationAboveThresholdSum);
                uint256 matchedProposalReward = _matchedRewards.mul(
                    proposalRewardsShare
                );
                proposalRewards[iReward].matched = matchedProposalReward;
            }
        }
        return proposalRewards;
    }

    /// @notice Calculates total proposal rewards (donated and matched) in particular epoch.
    /// @return Rewards amount assigned to this proposal in WEI.
    function proposalReward(
        uint32 epoch,
        uint256 proposalId
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
        for (uint256 iReward = 0; iReward < proposalRewards.length; iReward++) {
            if (
                proposalRewards[iReward].donated > proposalDonationThreshold &&
                proposalRewards[iReward].id == proposalId
            ) {
                uint256 proposalRewardsShare = proposalRewards[iReward]
                    .donated
                    .div(proposalDonationAboveThresholdSum);
                uint256 matchedProposalReward = _matchedRewards.mul(
                    proposalRewardsShare
                );
                return proposalRewards[iReward].donated + matchedProposalReward;
            }
        }
        return 0;
    }

    function _calculateProposalRewardsThreshold(
        uint256 proposalRewardsSum,
        ProposalRewards[] memory proposalRewards
    ) private pure returns (uint256, uint256) {
        uint256 proposalDonationThreshold = proposalRewardsSum.div(100).mul(
            PROPOSAL_DONATION_THRESHOLD_PERCENT
        );

        // calculate proposal donation above threshold.
        uint256 proposalDonationAboveThresholdSum;
        for (uint256 iReward = 0; iReward < proposalRewards.length; iReward++) {
            if (proposalRewards[iReward].donated > proposalDonationThreshold) {
                proposalDonationAboveThresholdSum += proposalRewards[iReward]
                    .donated;
            }
        }
        return (proposalDonationThreshold, proposalDonationAboveThresholdSum);
    }
}
