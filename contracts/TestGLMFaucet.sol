// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestGLMFaucet {

    uint256 constant public AMOUNT = 1000 ether;
    uint256 constant public WAIT_TIME = 24 hours;

    /// @notice GLM token contract address
    ERC20 public immutable glm;

    event Withdrawn(uint256 amount, uint256 when, address to);

    mapping(address => uint256) public nextAccessTime;

    /// @param glmAddress Address of TestGLM contract.
    constructor(address glmAddress) {
        glm = ERC20(glmAddress);
    }

    function sendMeGLM() external allowedToGetGLM(msg.sender) {
        require(glm.transfer(msg.sender, AMOUNT));
        nextAccessTime[msg.sender] = block.timestamp + WAIT_TIME;
        emit Withdrawn(AMOUNT, block.timestamp, msg.sender);
    }

    function sendGLM(address _recipient) external allowedToGetGLM(_recipient) {
        require(glm.transfer(_recipient, AMOUNT));
        nextAccessTime[_recipient] = block.timestamp + WAIT_TIME;
        emit Withdrawn(AMOUNT, block.timestamp, _recipient);
    }

    modifier allowedToGetGLM(address _recipient) {
        require(nextAccessTime[_recipient] == 0 || nextAccessTime[_recipient] < block.timestamp, "HN/must-wait-24-hours-since-last-withdraw");
        _;
    }
}
