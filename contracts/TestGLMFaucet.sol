// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestGLMFaucet {

    uint256 private constant AMOUNT = 1000 ether;
    uint256 constant public WAIT_TIME = 24 hours;

    /// @notice GLM token contract address
    ERC20 public immutable glm;

    event Withdrawn(uint256 amount, uint256 when, address to);

    mapping(address => uint256) nextAccessTime;

    /// @param glmAddress Address of TestGLM contract.
    constructor(address glmAddress) {
        glm = ERC20(glmAddress);
    }

    function sendMeGLM() external allowedToGetGLM {
        require(glm.transfer(msg.sender, AMOUNT));
        nextAccessTime[msg.sender] = block.timestamp + WAIT_TIME;
        emit Withdrawn(AMOUNT, block.timestamp, msg.sender);
    }

    modifier allowedToGetGLM() {
        require(nextAccessTime[msg.sender] == 0 || nextAccessTime[msg.sender] < block.timestamp, "HN/must-wait-24-hours-since-last-withdraw");
        _;
    }
}
