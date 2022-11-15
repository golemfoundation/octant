pragma solidity ^0.8.9;

interface IHexagonOracle {
    function getTotalETHStakingProceeds(uint256 epoch) external view returns (uint256);
}
