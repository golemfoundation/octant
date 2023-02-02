// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IProposals {
    struct Proposal {
        uint256 id;
        string uri;
    }

    function getProposalIds(
        uint256 _epoch
    ) external view returns (uint256[] memory);

    function getProposals(
        uint256 _epoch
    ) external view returns (Proposal[] memory);
}
