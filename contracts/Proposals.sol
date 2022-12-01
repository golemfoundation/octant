pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IProposals.sol";

contract Proposals is Ownable, IProposals {
    string public baseURI;
    mapping(uint256 => uint256[]) private proposalIdsByEpoch;

    constructor(string memory _initBaseURI) {
        setBaseURI(_initBaseURI);
        proposalIdsByEpoch[0] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setProposalIds(uint256 _epoch, uint256[] calldata _proposalIds) public onlyOwner {
        proposalIdsByEpoch[_epoch] = _proposalIds;
    }

    function getProposalIds(uint256 _epoch) public view returns (uint256[] memory) {
        for (uint256 iEpoch = _epoch; iEpoch > 0; iEpoch = iEpoch - 1) {
            if (proposalIdsByEpoch[iEpoch].length > 0) {
                return proposalIdsByEpoch[iEpoch];
            }
        }
        return proposalIdsByEpoch[0];
    }

    function getProposals(uint256 _epoch) external view returns (Proposal[] memory) {
        uint256[] memory proposalIds = getProposalIds(_epoch);
        Proposal[] memory proposals = new Proposal[](proposalIds.length);
        for (uint8 i = 0; i < proposalIds.length; i++) {
            uint256 id = proposalIds[i];
            string memory uri = string(abi.encodePacked(baseURI, Strings.toString(id)));
            proposals[i] = Proposal(id, uri);
        }
        return proposals;
    }
}
