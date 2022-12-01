pragma solidity ^0.8.9;

/* SPDX-License-Identifier: UNLICENSED */

interface IAllocationsStorage {
    struct Vote {
        uint256 alpha;
        uint256 proposalId;
    }

    function getUserVote(uint256 _epoch, address _user) external view returns (Vote memory);

    function addVote(
        uint256 _epoch,
        uint256 _proposalId,
        address _user,
        uint256 _alpha
    ) external;

    function removeVote(
        uint256 _epoch,
        uint256 _proposalId,
        address _user
    ) external;

    function getUsersAlphas(uint256 _epoch, uint256 _proposalId)
        external
        view
        returns (address[] memory, uint256[] memory);

    function getVotesCount(uint256 _epoch, uint256 _proposalId) external view returns (uint256);

    function getUser(
        uint256 _epoch,
        uint256 _proposalId,
        uint256 _index
    ) external view returns (address);
}
