// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

import "../interfaces/IEpochs.sol";
import "../interfaces/IRewards.sol";

import "./Withdrawals.sol";
import {PayoutsErrors, CommonErrors} from "../Errors.sol";

/// @title Contract tracking ETH payouts for Hexagon project.
/// @author Golem Foundation
contract Payouts {
    IRewards public immutable rewards;
    IEpochs public immutable epochs;
    // TODO change to Withdrawals contract when implemented
    Withdrawals public immutable withdrawals;

    struct Payout {
        // packed into two 32 byte slots
        // 16 bits is enough to store amount of ETH
        /// @dev last checkpointed epoch (=> funds from the epoch are are withdrawn)
        uint32 checkpointEpoch; // 32
        /// @dev total ETH payout by the end of checkpointed epoch, in wei
        uint144 checkpointSum; // 128+16
        /// @dev any extra ETH payout, less than required to checkpoint next epoch, in wei
        uint144 extra; // 128+16
        /// @dev total ETH payout, in wei
        uint144 total; // 128+16
    }

    /// @dev tracks ETH payouts to both GLM stakers and proposals
    mapping(address => Payout) public payouts;

    constructor(address rewardsAddress, address epochsAddress, address withdrawalsAddress) {
        rewards = IRewards(rewardsAddress);
        epochs = IEpochs(epochsAddress);
        withdrawals = Withdrawals(withdrawalsAddress);
    }

    /// @param payee GLM staker or proposal
    /// @param amount Payout amount
    function registerPayout(address payee, uint144 amount) public onlyWithdrawals {
        uint32 finalizedEpoch = epochs.getCurrentEpoch() - 1;
        Payout memory p = payouts[payee];
        uint144 remaining = amount;
        bool stop = false;
        while (!stop) {
            uint144 stepFunds = uint144(rewards.claimableReward(p.checkpointEpoch + 1, payee));
            if (p.extra + remaining > stepFunds) {
                remaining = remaining - (stepFunds - p.extra);
                p.checkpointEpoch = p.checkpointEpoch + 1;
                require(p.checkpointEpoch <= finalizedEpoch, PayoutsErrors.REGISTERING_UNEARNED_FUNDS);
                p.checkpointSum = p.checkpointSum + stepFunds;
                p.extra = 0;
            } else {
                stop = true;
                p.extra = p.extra + remaining;
                p.total = p.total + amount;
                assert(p.total == p.checkpointSum + p.extra);
            }
        }
        payouts[payee] = p;
    }

    function payoutStatus(address payee) external view returns (Payout memory) {
        return payouts[payee];
    }

    modifier onlyWithdrawals() {
        require(msg.sender == address(withdrawals), CommonErrors.UNAUTHORIZED_CALLER);
        _;
    }
}
