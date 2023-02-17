// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./../interfaces/IWithdrawalsTarget.sol";

import "./Payouts.sol";

import {PayoutsErrors, CommonErrors} from "../Errors.sol";

/// @title Contract triggering ETH payouts for Hexagon project.
/// @author Golem Foundation
contract PayoutsManager is Ownable {
    IWithdrawalsTarget public withdrawalsTarget;
    Payouts public immutable payouts;

    event WithdrawalsTargetSet(address oldValue, address newValue);

    constructor(address payoutsAddress) {
        payouts = Payouts(payoutsAddress);
    }

    function withdrawUser(uint144 amount) public {
        _withdrawUser(payable(msg.sender), amount);
    }

    function _withdrawUser(address payable user, uint144 amount) private {
        payouts.registerUserPayout(user, amount);
        withdrawalsTarget.withdrawRewards(user, amount);
    }

    function setTarget(address target) public {
        emit WithdrawalsTargetSet(address(withdrawalsTarget), target);
        withdrawalsTarget = IWithdrawalsTarget(target);
    }

}
