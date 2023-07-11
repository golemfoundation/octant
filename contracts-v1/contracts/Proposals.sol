// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.18;

import "./interfaces/IProposals.sol";
import "./interfaces/IEpochs.sol";

import {ProposalsErrors} from "./Errors.sol";
import "./OctantBase.sol";

/// @notice Contract tracking active Octant proposals in particular epoch.
/// Proposals are stored in IPFS in JSON format and are maintained entirely by Golem Foundation.
/// In order to get proposal details from IPFS call use returned values as this:
/// https://<IPFS Gateway of your choice>/ipfs/<CID>/<Proposal address>
// example: https://ipfs.io/ipfs/Qmbm97crHWQzNYNn2LPZ5hhGu4qEv1DXRP6qS4TCehruPn/1
contract Proposals is OctantBase, IProposals {
    /// @notice IPFS CID (Content identifier).
    /// Under this CID will be placed a directory with all the proposals,
    /// currently active and inactive.
    string public cid;

    /// @notice Epochs contract address.
    /// If not set, than Octant is in "pre-historical" phase (epochs zero and one).
    IEpochs public epochs;

    mapping(uint256 => address[]) private proposalAddressesByEpoch;

    /// @notice This event is emitted when Epochs contract is deployed and Proposals is notified about it.
    event EpochsSet(address epochs);

    constructor(
        string memory _initCID,
        address[] memory proposals,
        address _auth
    ) OctantBase(_auth) {
        cid = _initCID;

        require(
            _areEpochProposalsValid(proposals),
            ProposalsErrors.INVALID_PROPOSAL
        );
        proposalAddressesByEpoch[0] = proposals;
    }

    /// @notice sets a new IPFS CID, where proposals are stored.
    function setCID(string memory _newCID) external onlyMultisig {
        cid = _newCID;
    }

    /// @notice Sets epochs contract, can be done only once.
    function setEpochs(address _epochs) external onlyMultisig {
        require(
            address(epochs) == address(0x0),
            ProposalsErrors.CANNOT_SET_EPOCHS_TWICE
        );
        epochs = IEpochs(_epochs);
        emit EpochsSet(_epochs);
    }

    /// @notice sets proposal addresses that will be active in the particular epoch.
    /// Addresses should be provided as an array and will represent JSON file names stored under CID provided
    /// to this contract.
    function setProposalAddresses(
        uint256 _epoch,
        address[] calldata _proposalAddresses
    ) external onlyMultisig {
        if (address(epochs) != address(0x0)) {
            require(
                _epoch >= epochs.getCurrentEpoch(),
                ProposalsErrors.CHANGING_PROPOSALS_IN_THE_PAST
            );
        }
        require(
            _areEpochProposalsValid(_proposalAddresses),
            ProposalsErrors.INVALID_PROPOSAL
        );
        proposalAddressesByEpoch[_epoch] = _proposalAddresses;
    }

    /// @return list of active proposal addresses in given epoch.
    function getProposalAddresses(
        uint256 _epoch
    ) external view returns (address[] memory) {
        for (uint256 iEpoch = _epoch; iEpoch > 0; iEpoch = iEpoch - 1) {
            if (proposalAddressesByEpoch[iEpoch].length > 0) {
                return proposalAddressesByEpoch[iEpoch];
            }
        }
        return proposalAddressesByEpoch[0];
    }

    function _areEpochProposalsValid(
        address[] memory _proposals
    ) private pure returns (bool) {
        for (uint256 i = 0; i < _proposals.length; i++) {
            if (_proposals[i] == address(0)) return false;
        }

        return true;
    }
}
