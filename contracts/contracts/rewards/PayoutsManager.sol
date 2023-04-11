// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "./../interfaces/IWithdrawalsTarget.sol";

import "./Payouts.sol";
import "../Proposals.sol";
import "../OctantBase.sol";

import {PayoutsErrors, CommonErrors} from "../Errors.sol";

/// @title Contract triggering ETH payouts for Octant project.
/// @author Golem Foundation
contract PayoutsManager is OctantBase {
    Payouts public immutable payouts;
    Proposals public proposals;

    event ETHWithdrawal(Payouts.Payee payee, address owner, uint224 amount);

    constructor(
        address _payoutsAddress,
        address _proposalsAddress,
        address _auth)
    OctantBase(_auth) {
        payouts = Payouts(_payoutsAddress);
        proposals = Proposals(_proposalsAddress);
    }

    function withdrawUser(uint144 amount) external {
        _withdraw(Payouts.Payee.User, payable(msg.sender), amount);
    }

    function withdrawProposal(address proposalAddress, uint144 amount) external {
        require(proposals.isAuthorized(msg.sender, proposalAddress), CommonErrors.UNAUTHORIZED_CALLER);
        _withdraw(Payouts.Payee.Proposal, payable(proposalAddress), amount);
    }

    function withdrawGolemFoundation(uint144 amount) external onlyMultisig {
        address multisig = super.getMultisig();
        _withdraw(Payouts.Payee.GolemFoundation, payable(multisig), amount);
    }

    function emergencyWithdraw(uint144 amount) external onlyMultisig {
        address multisig = super.getMultisig();
        payable(multisig).transfer(amount);
    }

    function _withdraw(Payouts.Payee payee, address payable payeeAddress, uint144 amount) private {
        payouts.registerPayout(payee, payeeAddress, amount);
        payeeAddress.transfer(amount);

        emit ETHWithdrawal(payee, payeeAddress, amount);
    }

    receive() external payable {
        /* do not add any code here, it will get reverted because of tiny gas stipend */
    }
}
