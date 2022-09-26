// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Deposits {
    ERC20 public glm;

    event Deposited(uint256 amount, uint256 when, address depositor);
    event Withdrawed(uint256 amount, uint256 when, address depositor);

    struct Deposit {
        uint256 amount;
        uint256 since;
        uint256 until;
    }

    mapping(address => Deposit) public deposits;

    constructor(address glm_address) {
        glm = ERC20(glm_address);
    }

    function deposit(uint256 amount) public {
        require(
            (deposits[msg.sender].since == 0) ||
                (deposits[msg.sender].until != 0),
            "HN/deposit-already-exists"
        );
        Deposit memory newd = Deposit(amount, block.timestamp, 0);
        deposits[msg.sender] = newd;
        require(
            glm.transferFrom(msg.sender, address(this), amount),
            "HN/cannot-tranfer-from-sender"
        );
        emit Deposited(amount, block.timestamp, msg.sender);
    }

    function withdraw() public {
        require(deposits[msg.sender].since != 0, "HN/no-such-deposit");
        require(deposits[msg.sender].until == 0, "HN/already-withdrawn");
        deposits[msg.sender].until = block.timestamp;
        uint256 amount = deposits[msg.sender].amount;
        require(glm.transfer(msg.sender, amount));
        emit Withdrawed(amount, block.timestamp, msg.sender);
    }

    function active_stake_at(address staker, uint256 timestamp)
        public
        view
        returns (uint256)
    {
        Deposit memory d = deposits[staker];
        if (
            (d.since < timestamp) && ((d.until == 0) || (d.until > timestamp))
        ) {
            return d.amount;
        }
        return 0;
    }

    function stakes_since(address staker) public view returns (uint256) {
        return deposits[staker].since;
    }

    function stakes_until(address staker) public view returns (uint256) {
        return deposits[staker].until;
    }

    function stakes_amount(address staker) public view returns (uint256) {
        return deposits[staker].amount;
    }
}
