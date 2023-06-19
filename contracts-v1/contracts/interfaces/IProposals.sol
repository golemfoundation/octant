// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.16;

interface IProposals {
    function getProposalAddresses(
        uint256 _epoch
    ) external view returns (address[] memory);
}
