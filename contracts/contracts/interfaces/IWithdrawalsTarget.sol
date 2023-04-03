
// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface IWithdrawalsTarget {
    function withdrawToVault(uint256) external;
    function withdrawToMultisig(uint256) external;
}
