// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Deposits {
		ERC20 public glm;

		event Deposited(uint amount, uint when, address depositor);
    event Withdrawed(uint amount, uint when, address depositor);

		struct Deposit {
				uint amount;
				uint since;
				uint until;
		}

		mapping(address => Deposit) public deposits;

    constructor(address glm_address) {
				glm	= ERC20(glm_address);
		}

		function deposit(uint amount) public {
				require((deposits[msg.sender].since == 0) || (deposits[msg.sender].until != 0), "HN/deposit-already-exists");
				Deposit memory newd = Deposit(amount, block.timestamp, 0);
				deposits[msg.sender] = newd;
				require(glm.transferFrom(msg.sender, address(this), amount), "HN/cannot-tranfer-from-sender");
				emit Deposited(amount, block.timestamp, msg.sender);
		}

		function withdraw() public {
				require(deposits[msg.sender].since != 0, "HN/no-such-deposit");
				require(deposits[msg.sender].until == 0, "HN/already-withdrawn");
				deposits[msg.sender].until = block.timestamp;
				uint amount = deposits[msg.sender].amount;
				require(glm.transfer(msg.sender, amount));
				emit Withdrawed(amount, block.timestamp, msg.sender);
		}

		function stakes_since(address staker) public view returns (uint) {
				return deposits[staker].since;
		}

		function stakes_until(address staker) public view returns (uint) {
				return deposits[staker].until;
		}

		function stakes_amount(address staker) public view returns (uint) {
				return deposits[staker].amount;
		}
}
