// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "../interfaces/IEpochs.sol";
import "../interfaces/IRewards.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {PayoutsErrors, CommonErrors} from "../Errors.sol";

/// @title Contract tracking ETH payouts for Octant project.
/// @author Golem Foundation
contract Payouts is Ownable {
    IRewards public immutable rewards;
    IEpochs public immutable epochs;
    address public payoutsManager;

    enum Payee { User, Proposal, GolemFoundation }

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

    /// @dev tracks ETH payouts to GLM stakers, proposals and Golem Foundation
    mapping(address => Payout) public payouts;

    constructor(
        address rewardsAddress,
        address epochsAddress
    ) {
        rewards = IRewards(rewardsAddress);
        epochs = IEpochs(epochsAddress);
    }

    /// @param payeeAddress address of a payee (user, proposal, of Golem Foundation)
    /// @param amount Payout amount
    function registerPayout(
        Payee payee,
        address payeeAddress,
        uint144 amount
    ) public onlyPayoutsManager {
        uint32 finalizedEpoch = getFinalizedEpoch();
        Payout memory p = payouts[payeeAddress];
        uint144 remaining = amount;
        bool stop = false;
        while (!stop) {
            uint144 stepFunds = uint144(
                _getRewards(payee, p.checkpointEpoch + 1, payeeAddress)
            );
            if (p.extra + remaining > stepFunds) {
                remaining = remaining - (stepFunds - p.extra);
                p.checkpointEpoch = p.checkpointEpoch + 1;
                require(
                    p.checkpointEpoch <= finalizedEpoch,
                    PayoutsErrors.REGISTERING_UNEARNED_FUNDS
                );
                p.checkpointSum = p.checkpointSum + stepFunds;
                p.extra = 0;
            } else {
                stop = true;
                p.extra = p.extra + remaining;
                p.total = p.total + amount;
                assert(p.total == p.checkpointSum + p.extra);
            }
        }
        payouts[payeeAddress] = p;
    }

    function payoutStatus(
        address user
    ) external view returns (Payout memory) {
        return payouts[user];
    }


    function setPayoutsManager(address _payoutsManager) public onlyOwner {
        require(payoutsManager == address(0x0), "HN/Payouts:already-initialized");
        payoutsManager = _payoutsManager;
    }

    /// @dev returns most recent epoch from which funds can be spent
    function getFinalizedEpoch() public view returns (uint32) {
        if (epochs.isDecisionWindowOpen()) {
            return epochs.getCurrentEpoch() - 1;
        }
        else {
            return epochs.getCurrentEpoch() - 2;
        }
    }

    function _getRewards(Payee payee, uint32 epoch, address payeeAddress) private view returns (uint256) {
        if (payee == Payee.User) {
            return rewards.claimableReward(epoch, payeeAddress);
        } else if (payee == Payee.Proposal) {
            return rewards.proposalReward(epoch, payeeAddress);
        } else if (payee == Payee.GolemFoundation) {
            return rewards.golemFoundationReward(epoch);
        } else {
            revert();
        }
    }

    modifier onlyPayoutsManager() {
        require(
            msg.sender == payoutsManager,
            CommonErrors.UNAUTHORIZED_CALLER
        );
        _;
    }
}
