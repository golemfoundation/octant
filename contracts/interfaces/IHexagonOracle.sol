// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

interface IHexagonOracle {
    function getTotalETHStakingProceeds(uint32 epoch) external view returns (uint256);
}
