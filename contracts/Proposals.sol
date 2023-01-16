// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IProposals.sol";

/// @notice Contract tracking active Hexagon proposals in particular epoch.
/// Proposals are stored in IPFS in JSON format and are maintained entirely by Golem Foundation.
contract Proposals is Ownable, IProposals {
    /// @notice IPFS CID (Content identifier).
    /// Under this CID will be placed a directory with all the proposals,
    /// currently active and inactive.
    string public CID;

    mapping(uint256 => uint256[]) private proposalIdsByEpoch;

    constructor(string memory _initCID) {
        setCID(_initCID);
        proposalIdsByEpoch[0] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }

    /// @notice sets a new IPFS CID, where proposals are stored.
    function setCID(string memory _newCID) public onlyOwner {
        CID = _newCID;
    }

    /// @notice sets proposal Ids that will be active in the particular epoch.
    /// Ids should be provided as an array and will represent JSON file names stored under CID provided
    /// to this contract.
    function setProposalIds(uint256 _epoch, uint256[] calldata _proposalIds) public onlyOwner {
        proposalIdsByEpoch[_epoch] = _proposalIds;
    }

    /// @return list of proposal Ids active in given epoch.
    function getProposalIds(uint256 _epoch) public view returns (uint256[] memory) {
        for (uint256 iEpoch = _epoch; iEpoch > 0; iEpoch = iEpoch - 1) {
            if (proposalIdsByEpoch[iEpoch].length > 0) {
                return proposalIdsByEpoch[iEpoch];
            }
        }
        return proposalIdsByEpoch[0];
    }

    /// @notice In order to get proposal details from IPFS call use returned values as this:
    /// https://<IPFS Gateway of your choice>/ipfs/<CID>/<Proposal ID>
    // example: https://ipfs.io/ipfs/Qmbm97crHWQzNYNn2LPZ5hhGu4qEv1DXRP6qS4TCehruPn/1
    /// @return list of proposal active in given epoch as a struct containing CID and proposal id.
    function getProposals(uint256 _epoch) external view returns (Proposal[] memory) {
        uint256[] memory proposalIds = getProposalIds(_epoch);
        Proposal[] memory proposals = new Proposal[](proposalIds.length);
        for (uint256 i = 0; i < proposalIds.length; i++) {
            uint256 id = proposalIds[i];
            string memory uri = string(abi.encodePacked(CID, Strings.toString(id)));
            proposals[i] = Proposal(id, uri);
        }
        return proposals;
    }
}
