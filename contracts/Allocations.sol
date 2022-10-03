pragma solidity ^0.8.9;

contract Allocations {

    struct Vote {
        uint proposalId;
        uint8 alpha;
    }

    mapping (uint32 => mapping (address => Vote)) public participantVoteByEpoch;
    mapping (uint32 => mapping (uint8 => uint8)) public votesCountByEpoch;

    constructor() public {
    }

    function vote(uint8 _proposalId, uint8 _alpha) external {
        require(_alpha >= 0 && _alpha <= 100, "HN/alpha-out-of-range");
        // TODO epoch hardcoded at the moment, remove after GE-16
        uint32 epoch = 1;
        participantVoteByEpoch[epoch][msg.sender] = Vote(_proposalId, _alpha);
        votesCountByEpoch[epoch][_proposalId] = votesCountByEpoch[epoch][_proposalId] + 1;

        emit Voted(epoch, msg.sender, _proposalId, _alpha);
    }

    function getAlpha(uint32 _epoch, address _participant) public view returns (uint8) {
        return participantVoteByEpoch[_epoch][_participant].alpha;
    }

    function getVotesCount(uint32 _epoch, uint8 _proposalId) public view returns (uint8) {
        return votesCountByEpoch[_epoch][_proposalId];
    }

    event Voted(uint32 indexed epoch, address indexed participant, uint8 proposalId, uint8 alpha);
}
