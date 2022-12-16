// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestGLMFaucet {
    uint256 public constant AMOUNT = 1000 ether;

    /// @notice GLM token contract address
    ERC20 public immutable glm;

    event Withdrawn(uint256 amount, uint256 when, address to);

    /// @param glmAddress Address of TestGLM contract.
    constructor(address glmAddress) {
        glm = ERC20(glmAddress);
    }

    function sendMeGLM() external {
        require(glm.transfer(msg.sender, AMOUNT));
        emit Withdrawn(AMOUNT, block.timestamp, msg.sender);
    }

    function sendGLM(address _recipient) external {
        require(glm.transfer(_recipient, AMOUNT));
        emit Withdrawn(AMOUNT, block.timestamp, _recipient);
    }
}
