// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IProposals.sol";

/// @notice Contract tracking active Hexagon proposals in particular epoch.
/// Proposals are stored in IPFS in JSON format and are maintained entirely by Golem Foundation.
/// In order to get proposal details from IPFS call use returned values as this:
/// https://<IPFS Gateway of your choice>/ipfs/<CID>/<Proposal address>
// example: https://ipfs.io/ipfs/Qmbm97crHWQzNYNn2LPZ5hhGu4qEv1DXRP6qS4TCehruPn/1
contract Proposals is Ownable, IProposals {
    /// @notice IPFS CID (Content identifier).
    /// Under this CID will be placed a directory with all the proposals,
    /// currently active and inactive.
    string public cid;

    mapping(uint256 => address[]) private proposalAddressesByEpoch;

    constructor(string memory _initCID, address[] memory proposals) {
        setCID(_initCID);
        proposalAddressesByEpoch[0] = proposals;
    }

    /// @notice sets a new IPFS CID, where proposals are stored.
    function setCID(string memory _newCID) public onlyOwner {
        cid = _newCID;
    }

    /// @notice sets proposal Ids that will be active in the particular epoch.
    /// Ids should be provided as an array and will represent JSON file names stored under CID provided
    /// to this contract.
    function setProposalAddresses(
        uint256 _epoch,
        address[] calldata _proposalAddresses
    ) public onlyOwner {
        proposalAddressesByEpoch[_epoch] = _proposalAddresses;
    }

    /// @return list of active proposal addresses in given epoch.
    function getProposalAddresses(
        uint256 _epoch
    ) public view returns (address[] memory) {
        for (uint256 iEpoch = _epoch; iEpoch > 0; iEpoch = iEpoch - 1) {
            if (proposalAddressesByEpoch[iEpoch].length > 0) {
                return proposalAddressesByEpoch[iEpoch];
            }
        }
        return proposalAddressesByEpoch[0];
    }
}
