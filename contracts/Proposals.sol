// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IProposals.sol";
import "./interfaces/IEpochs.sol";

import {ProposalsErrors} from "./Errors.sol";

/// @notice Contract tracking active Octant proposals in particular epoch.
/// Proposals are stored in IPFS in JSON format and are maintained entirely by Golem Foundation.
/// In order to get proposal details from IPFS call use returned values as this:
/// https://<IPFS Gateway of your choice>/ipfs/<CID>/<Proposal address>
// example: https://ipfs.io/ipfs/Qmbm97crHWQzNYNn2LPZ5hhGu4qEv1DXRP6qS4TCehruPn/1
contract Proposals is Ownable, IProposals {
    /// @notice IPFS CID (Content identifier).
    /// Under this CID will be placed a directory with all the proposals,
    /// currently active and inactive.
    string public cid;

    IEpochs public epochs;

    mapping(uint256 => address[]) private proposalAddressesByEpoch;

    /// @notice mapping that stores account authorized to withdraw funds on behalf of the proposal.
    /// This is additional account, main proposal account is also eligible to withdraw.
    mapping(address => address) private authorizedAccountByProposal;

    constructor(address _epochs, string memory _initCID, address[] memory proposals) {
        epochs = IEpochs(_epochs);
        setCID(_initCID);
        proposalAddressesByEpoch[0] = proposals;
    }

    /// @notice sets a new IPFS CID, where proposals are stored.
    function setCID(string memory _newCID) public onlyOwner {
        cid = _newCID;
    }

    /// @notice sets proposal addresses that will be active in the particular epoch.
    /// Addresses should be provided as an array and will represent JSON file names stored under CID provided
    /// to this contract.
    function setProposalAddresses(
        uint256 _epoch,
        address[] calldata _proposalAddresses
    ) public onlyOwner {
        require(epochs.getCurrentEpoch() < _epoch, ProposalsErrors.CHANGING_PROPOSALS_IN_THE_PAST);
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

    /// @dev Returns whether the account is authorized for the given proposal.
    /// @param proposal The proposal to check authorization for.
    /// @param account The account to check authorization for.
    /// @return True if the account is authorized for the proposal, false otherwise.
    function isAuthorized(address proposal, address account) public view returns (bool) {
        return proposal == account || authorizedAccountByProposal[proposal] == account;
    }

    /// @dev Sets the authorized account for the given proposal.
    /// @param proposal The proposal to set the authorized account for.
    /// @param account The account to authorize for the proposal.
    /// @notice Only the owner of the contract can call this function.
    function setAuthorizedAccount(address proposal, address account) external onlyOwner {
        authorizedAccountByProposal[proposal] = account;
    }
}
