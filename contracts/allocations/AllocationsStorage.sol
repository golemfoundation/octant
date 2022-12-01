// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAllocationsStorage.sol";

contract AllocationsStorage is Ownable, IAllocationsStorage {
    mapping(bytes32 => Vote) private votesByUser;
    mapping(bytes32 => address) private votesByProposal;
    mapping(bytes32 => uint256) private votesCount;
    mapping(bytes32 => uint256) private voteIndex;

    // @notice Get user's vote in given epoch.
    function getUserVote(uint256 _epoch, address _user) external view returns (Vote memory) {
        return _getVoteByUser(_epoch, _user);
    }

    // @notice Add a vote. Requires that the vote does not exist.
    function addVote(
        uint256 _epoch,
        uint256 _proposalId,
        address _user,
        uint256 _alpha
    ) external onlyOwner {
        require(_getVoteIndex(_epoch, _proposalId, _user) == 0, "HN/vote-already-exists");
        uint256 count = _getVotesCount(_epoch, _proposalId);
        _setVoteByProposal(_epoch, _proposalId, count + 1, _user);
        _setVoteIndex(_epoch, _proposalId, _user, count + 1);
        _setVotesCount(_epoch, _proposalId, count + 1);
        _setVoteByUser(_epoch, _user, _proposalId, _alpha);
    }

    // @notice Remove a vote. Swaps the item with the last item in the set and truncates it; computationally cheap.
    // Requires that the vote exists.
    function removeVote(
        uint256 _epoch,
        uint256 _proposalId,
        address _user
    ) external onlyOwner {
        uint256 index = _getVoteIndex(_epoch, _proposalId, _user);
        require(index > 0, "HN/vote-does-not-exist");
        uint256 count = _getVotesCount(_epoch, _proposalId);
        if (index < count) {
            address lastVote = _getVoteByProposal(_epoch, _proposalId, count);
            _setVoteByProposal(_epoch, _proposalId, index, lastVote);
            _setVoteIndex(_epoch, _proposalId, lastVote, index);
        }
        _setVoteIndex(_epoch, _proposalId, _user, 0);
        _setVotesCount(_epoch, _proposalId, count - 1);
        _setVoteByUser(_epoch, _user, 0, 0);
    }

    // @notice Users for given proposal.
    function getUsersAlphas(uint256 _epoch, uint256 _proposalId)
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        uint256 count = _getVotesCount(_epoch, _proposalId);
        address[] memory users = new address[](count);
        uint256[] memory alphas = new uint256[](count);
        for (uint256 i = 1; i <= count; i++) {
            address user = getUser(_epoch, _proposalId, i);
            users[i - 1] = user;
            alphas[i - 1] = _getVoteByUser(_epoch, user).alpha;
        }
        return (users, alphas);
    }

    // @notice The number of votes for proposal.
    function getVotesCount(uint256 _epoch, uint256 _proposalId) external view returns (uint256) {
        return _getVotesCount(_epoch, _proposalId);
    }

    // @notice The user address by index. Iteration starts from 1.
    function getUser(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index
    ) public view returns (address) {
        return _getVoteByProposal(_epoch, _proposalId, _index);
    }

    // @notice Get vote by proposal.
    function _getVoteByProposal(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index
    ) private view returns (address) {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".index", _index)
        );
        return votesByProposal[key];
    }

    // @notice Set vote by proposal.
    function _setVoteByProposal(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index,
        address _user
    ) private {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".index", _index)
        );
        votesByProposal[key] = _user;
    }

    // @notice Get vote by proposal.
    function _getVoteByUser(uint256 _epoch, address _user) private view returns (Vote memory) {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".user", _user));
        return votesByUser[key];
    }

    // @notice Set vote by proposal.
    function _setVoteByUser(
        uint256 _epoch,
        address _user,
        uint256 _proposalId,
        uint256 _alpha
    ) private {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".user", _user));
        votesByUser[key] = Vote(_alpha, _proposalId);
    }

    // @notice Get votes count.
    function _getVotesCount(uint256 _epoch, uint256 _proposalId) private view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".proposalId", _proposalId));
        return votesCount[key];
    }

    // @notice Set votes count.
    function _setVotesCount(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _count
    ) private {
        bytes32 key = keccak256(abi.encodePacked(_epoch, ".proposalId", _proposalId));
        votesCount[key] = _count;
    }

    // @notice Get vote index.
    function _getVoteIndex(
        uint256 _epoch,
        uint256 _proposalId,
        address _user
    ) private view returns (uint256) {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".user", _user)
        );
        return voteIndex[key];
    }

    // @notice Set vote index.
    function _setVoteIndex(
        uint256 _epoch,
        uint256 _proposalId,
        address _user,
        uint256 _index
    ) private {
        bytes32 key = keccak256(
            abi.encodePacked(_epoch, ".proposalId", _proposalId, ".user", _user)
        );
        voteIndex[key] = _index;
    }
}
