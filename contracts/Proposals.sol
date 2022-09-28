pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Proposals is Ownable {
    struct Proposal {
        uint8 id;
        string uri;
    }

    string public baseURI;
    uint8 public proposalsCount;

    constructor(string memory _initBaseURI, uint8 _proposalsCount) {
        setBaseURI(_initBaseURI);
        setProposalsCount(_proposalsCount);
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setProposalsCount(uint8 _proposalsCount) public onlyOwner {
        proposalsCount = _proposalsCount;
    }

    function getProposals() external view returns (Proposal[] memory) {
        Proposal[] memory proposals = new Proposal[](proposalsCount);
        for (uint8 i = 0; i < proposalsCount; i++) {
            string memory uri = string(abi.encodePacked(baseURI, Strings.toString(i)));
            proposals[i] = Proposal(i, uri);
        }
        return proposals;
    }
}
