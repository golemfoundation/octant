
// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

interface IWithdrawalsTarget {
    function withdrawRewards(address, uint256) external;
}
