// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./../interfaces/IWithdrawalsTarget.sol";

import "./Payouts.sol";
import "../Proposals.sol";

import {PayoutsErrors, CommonErrors} from "../Errors.sol";

/// @title Contract triggering ETH payouts for Octant project.
/// @author Golem Foundation
contract PayoutsManager is Ownable {
    Payouts public immutable payouts;
    address public golemFoundationWithdrawalAddress;
    Proposals public proposals;

    event ETHWithdrawal(Payouts.Payee payee, address owner, uint224 amount);

    constructor(address _payoutsAddress, address _golemFoundationWithdrawalAddress, address _proposalsAddress) {
        payouts = Payouts(_payoutsAddress);
        golemFoundationWithdrawalAddress = _golemFoundationWithdrawalAddress;
        proposals = Proposals(_proposalsAddress);
    }

    function withdrawUser(uint144 amount) public {
        emit ETHWithdrawal(Payouts.Payee.User, msg.sender, amount);
        _withdraw(Payouts.Payee.User, payable(msg.sender), amount);
    }

    function withdrawProposal(address proposalAddress, uint144 amount) public {
        require(proposals.isAuthorized(msg.sender, proposalAddress), CommonErrors.UNAUTHORIZED_CALLER);
        emit ETHWithdrawal(Payouts.Payee.Proposal, proposalAddress, amount);
        _withdraw(Payouts.Payee.Proposal, payable(proposalAddress), amount);
    }

    function withdrawGolemFoundation(uint144 amount) public {
        require(msg.sender == golemFoundationWithdrawalAddress, CommonErrors.UNAUTHORIZED_CALLER);
        emit ETHWithdrawal(Payouts.Payee.GolemFoundation, golemFoundationWithdrawalAddress, amount);
        _withdraw(Payouts.Payee.GolemFoundation, payable(golemFoundationWithdrawalAddress), amount);
    }

    function emergencyWithdraw(uint144 amount) external onlyOwner {
        payable(golemFoundationWithdrawalAddress).transfer(amount);
    }

    function setGolemFoundationMultisigAddress(address newAddress) external onlyOwner {
        golemFoundationWithdrawalAddress = newAddress;
    }

    function _withdraw(Payouts.Payee payee, address payable payeeAddress, uint144 amount) private {
        payouts.registerPayout(payee, payeeAddress, amount);
        payeeAddress.transfer(amount);
    }

    receive() external payable {
        /* do not add any code here, it will get reverted because of tiny gas stipend */
    }
}
