// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IHexagonOracle {
    function getTotalETHStakingProceeds(uint32 epoch) external view returns (uint256);
}
